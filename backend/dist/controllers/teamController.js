import Team from '../models/Team';
import User from '../models/User';
import mongoose from 'mongoose';
// Create a new team
export const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = await Team.create({
            name,
            owner: new mongoose.Types.ObjectId(userId),
            members: [{ user: new mongoose.Types.ObjectId(userId), role: 'owner' }],
        });
        res.status(201).json(team);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get user's teams
export const getTeams = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const teams = await Team.find({
            'members.user': userId,
        }).populate('owner members.user', 'name email');
        res.json(teams);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Invite team member
export const inviteTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role = 'member' } = req.body;
        const userId = req.user?.userId;
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        // Check if user has permission
        const member = team.members.find((m) => m.user.toString() === userId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        // Check if already invited
        const existingInvite = team.invitations.find((inv) => inv.email === email && inv.status === 'pending');
        if (existingInvite) {
            return res.status(400).json({ message: 'Already invited' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        team.invitations.push({
            email,
            role,
            invitedBy: new mongoose.Types.ObjectId(userId),
            invitedAt: new Date(),
            status: 'pending',
        });
        await team.save();
        res.json({ message: 'Invitation sent', team });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Accept invitation
export const acceptInvitation = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userEmail = req.user?.email;
        const userId = req.user?.userId;
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const invitation = team.invitations.find((inv) => inv.email === userEmail && inv.status === 'pending');
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Update invitation status
        invitation.status = 'accepted';
        // Add user to members
        team.members.push({
            user: new mongoose.Types.ObjectId(userId),
            role: invitation.role,
            joinedAt: new Date(),
        });
        await team.save();
        res.json({ message: 'Invitation accepted', team });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get team members
export const getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId).populate('members.user', 'name email');
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.json(team.members);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Search users by email
export const searchUsers = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email required' });
        }
        const users = await User.find({
            email: { $regex: email, $options: 'i' },
        })
            .select('name email')
            .limit(10);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
