const User = require('../models/user.model');
const Loan = require('../models/loan.model');
const Payment = require('../models/payment.model');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

exports.getOverview = async (req, res) => {
    try {
        // Get total loans amount
        const loansTotal = await Loan.sum('amount', {
            where: {
                status: {
                    [Op.in]: ['active', 'completed']
                }
            }
        }) || 0;

        // Get pending loan approvals count
        const pendingLoans = await Loan.count({
            where: {
                status: 'pending'
            }
        });

        // Get total payments
        const paymentsTotal = await Payment.sum('amount', {
            where: {
                status: 'completed'
            }
        }) || 0;

        // Get recent payments count
        const recentPayments = await Payment.count({
            where: {
                created_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                },
                status: 'completed'
            }
        });

        // Get recent members with their join dates
        const recentMembers = await User.findAll({
            where: {
                role: 'member',
                created_at: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            },
            attributes: ['id', 'fullName', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        res.json({
            loans: {
                total: loansTotal,
                pendingApprovals: pendingLoans
            },
            payments: {
                total: paymentsTotal,
                recentCount: recentPayments
            },
            recentMembers: recentMembers.map(member => ({
                id: member.id,
                fullName: member.fullName,
                joinedDate: member.created_at
            }))
        });
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        res.status(500).json({ message: 'Failed to fetch overview data' });
    }
};
