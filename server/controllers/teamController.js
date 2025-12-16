import mongoose from "mongoose";
import dotenv from "dotenv";
import teamModel from "../models/team.model.js";
import sendMail from "../utils/mailer.js";

dotenv.config();

/**
 * Create a team
 */
export const createTeam = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, domain, description, maxMembers = 2 } = req.body;
    if (!name || !domain)
      return res
        .status(400)
        .json({ success: false, message: "Name and domain required" });

    const team = await teamModel.create({
      name,
      domain,
      description: description || "",
      creator: requesterId,
      maxMembers,
      members: [],
      applicants: [],
      rejectedApplicants: [],
      isOpen: true,
    });

    return res.status(201).json({ success: true, team });
  } catch (error) {
    console.error("createTeam error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Show teams created by the requester
 */
export const showCreatedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // fetching teams for creator

    const teams = await teamModel
      .find({ creator: new mongoose.Types.ObjectId(requesterId) })
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .sort({ createdAt: -1 });

    // teams found (omitted verbose debug output)

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showCreatedTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Show available teams (optional authenticated user)
 */
export const showAvailableTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { domain } = req.query;

    const baseQuery = { isOpen: true };
    if (domain) baseQuery.domain = String(domain).trim();

    if (requesterId) {
      baseQuery.$nor = [
        { creator: new mongoose.Types.ObjectId(requesterId) },
        { "applicants.user": new mongoose.Types.ObjectId(requesterId) },
        { members: new mongoose.Types.ObjectId(requesterId) },
        { "rejectedApplicants.user": new mongoose.Types.ObjectId(requesterId) },
      ];
    }

    const teams = await teamModel
      .find(baseQuery)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showAvailableTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Teams where user interacted (applicants, members or rejected)
 */
export const appliedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const oid = new mongoose.Types.ObjectId(requesterId);
    const teams = await teamModel
      .find({
        $or: [
          { "applicants.user": oid },
          { members: oid },
          { "rejectedApplicants.user": oid },
        ],
      })
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("appliedTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get team by id
 */
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamId" });

    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email");

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    return res.status(200).json({ success: true, team });
  } catch (error) {
    console.error("getTeamById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Apply to a team
 */
export const applyToTeam = async (req, res) => {
  // applyToTeam handler

  try {
    const requesterId = req.user?.id;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { teamId } = req.params;
    const { linkedin, github, resume } = req.body;

    // extracted data

    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamId" });
    }

    // Validate required fields
    if (!linkedin || !github || !resume) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn, GitHub, and Resume links are required",
      });
    }

    // finding team
    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email");

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // team found

    // Check if user is the creator
    const creatorId = String(team.creator._id || team.creator);
    if (creatorId === String(requesterId)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot apply to your own team" });
    }

    // Check if already a member
    const isMember = (team.members || []).some(
      (m) => String(m._id || m) === String(requesterId)
    );
    if (isMember) {
      return res
        .status(400)
        .json({ success: false, message: "Already a member" });
    }

    // Check if already applied
    const hasApplied = (team.applicants || []).some(
      (a) => String(a.user?._id || a.user) === String(requesterId)
    );
    if (hasApplied) {
      return res
        .status(400)
        .json({ success: false, message: "Already applied" });
    }

    // Check if previously rejected
    const wasRejected = (team.rejectedApplicants || []).some(
      (a) => String(a.user?._id || a.user) === String(requesterId)
    );
    if (wasRejected) {
      return res
        .status(400)
        .json({ success: false, message: "Application previously rejected" });
    }

    // Check if team is full
    if ((team.members?.length || 0) >= (team.maxMembers || 2)) {
      return res.status(400).json({ success: false, message: "Team is full" });
    }

    // validations passed

    const applicant = {
      user: new mongoose.Types.ObjectId(requesterId),
      linkedin: String(linkedin).trim(),
      github: String(github).trim(),
      resume: String(resume).trim(),
      appliedAt: new Date(),
    };

    // created applicant object

    // Add applicant to team
    team.applicants.push(applicant);

    // added applicant and saving

    // Use updateOne to avoid validating the entire document
    await teamModel.updateOne(
      { _id: teamId },
      { $push: { applicants: applicant } }
    );

    // team saved successfully

    // Send email notification (non-blocking)
    try {
      if (team.creator && team.creator.email && team.name) {
        // send notification email
        await sendMail({
          to: team.creator.email,
          subject: `New application for "${team.name}"`,
          text: `User applied to your team.\n\nTeam: ${team.name}\nApplicant ID: ${requesterId}`,
        });
      } else {
        // missing email data; skip notification
      }
    } catch (mailErr) {
      console.error("Failed to send notification email:", mailErr);
      // Don't fail the request if email fails
    }

    // success
    return res
      .status(200)
      .json({ success: true, message: "Applied successfully" });
  } catch (error) {
    console.error("applyToTeam error:", error);

    // Check for specific MongoDB errors
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
      });
    }

    if (error.name === "CastError") {
      console.error("Cast error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Accept an applicant (creator only)
 */
export const acceptApplicant = async (req, res) => {
  // accept applicant handler

  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // finding team and applicants
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // team found

    if (String(team.creator) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );

    if (applicantIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    if ((team.members?.length || 0) >= (team.maxMembers || 2)) {
      return res
        .status(400)
        .json({ success: false, message: "Team is already full" });
    }

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    // applicant details

    // Use atomic operations to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      {
        $push: { members: new mongoose.Types.ObjectId(applicantId) },
        $pull: {
          applicants: { user: new mongoose.Types.ObjectId(applicantId) },
        },
      }
    );

    // update result

    // Check if team should be closed (separately to avoid validation issues)
    const updatedTeam = await teamModel.findById(teamId);
    if ((updatedTeam.members?.length || 0) >= (updatedTeam.maxMembers || 2)) {
      await teamModel.updateOne({ _id: teamId }, { isOpen: false });
    }

    // Send acceptance email (non-blocking)
    if (applicantEmail && team.name) {
      try {
        await sendMail({
          to: applicantEmail,
          subject: `Accepted to "${team.name}"`,
          html: `<p>Hi ${
            applicantName || "there"
          },</p><p>Congratulations — you have been accepted to join the team "<strong>${
            team.name
          }</strong>". Welcome aboard!</p>`,
        });
      } catch (emailError) {
        console.error("acceptApplicant email error:", emailError);
      }
    }

    // success
    return res
      .status(200)
      .json({ success: true, message: "Applicant accepted" });
  } catch (error) {
    console.error("acceptApplicant error:", error);

    // Check for specific MongoDB errors
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Reject an applicant (creator only)
 */
export const rejectApplicant = async (req, res) => {
  // rejectApplicant handler

  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // finding team
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // team found

    if (String(team.creator) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );

    if (applicantIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    // applicant details

    // Create rejected applicant object
    const rejectedApplicant = {
      user: applicant.user._id || applicant.user,
      linkedin: applicant.linkedin,
      github: applicant.github,
      resume: applicant.resume,
      appliedAt: applicant.appliedAt,
      rejectedAt: new Date(),
    };

    // Use atomic operations to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      {
        $push: { rejectedApplicants: rejectedApplicant },
        $pull: {
          applicants: { user: new mongoose.Types.ObjectId(applicantId) },
        },
      }
    );

    // update result

    // Send rejection email (non-blocking)
    if (applicantEmail && team.name) {
      try {
        await sendMail({
          to: applicantEmail,
          subject: `Update on your application to "${team.name}"`,
          html: `<p>Hi ${
            applicantName || "there"
          },</p><p>Thank you for applying to "<strong>${
            team.name
          }</strong>". After careful consideration, we have decided to move forward with other candidates.</p>`,
        });
      } catch (emailError) {
        console.error("rejectApplicant email error:", emailError);
      }
    }

    // success
    return res
      .status(200)
      .json({ success: true, message: "Applicant rejected" });
  } catch (error) {
    console.error("rejectApplicant error:", error);

    // Check for specific MongoDB errors
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Withdraw application (applicant only)
 */
export const withdrawApplication = async (req, res) => {
  // withdraw application handler

  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // only allow withdrawing your own application
    if (String(requesterId) !== String(applicantId)) {
      return res.status(403).json({
        success: false,
        message: "Can only withdraw your own application",
      });
    }

    // finding team
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // team found

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => String(a.user?._id || a.user) === String(applicantId)
    );

    if (applicantIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // withdrawing application

    // Use atomic operation to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      {
        $pull: {
          applicants: { user: new mongoose.Types.ObjectId(applicantId) },
        },
      }
    );

    // update result
    // withdraw success

    return res
      .status(200)
      .json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    console.error("=== withdrawApplication ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Check for specific MongoDB errors
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Toggle recruiting status (creator only)
 */
export const toggleRecruiting = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { teamId } = req.params;
    const { isOpen } = req.body; // optional, if missing we'll toggle

    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamId" });

    const team = await teamModel.findById(teamId).select("creator isOpen name");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) !== String(requesterId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const newIsOpen = typeof isOpen === "boolean" ? isOpen : !team.isOpen;

    await teamModel.updateOne({ _id: teamId }, { $set: { isOpen: newIsOpen } });

    const updated = await teamModel.findById(teamId).select("isOpen name");

    return res.status(200).json({
      success: true,
      message: newIsOpen ? "Recruiting opened" : "Recruiting stopped",
      team: updated,
    });
  } catch (error) {
    console.error("toggleRecruiting error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
