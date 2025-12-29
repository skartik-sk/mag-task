import mongoose, { Schema } from 'mongoose';
const teamSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member'],
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    invitations: [
        {
            email: {
                type: String,
                required: true,
                lowercase: true,
            },
            role: {
                type: String,
                enum: ['admin', 'member'],
                default: 'member',
            },
            invitedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            invitedAt: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        },
    ],
}, {
    timestamps: true,
});
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
export default mongoose.model('Team', teamSchema);
