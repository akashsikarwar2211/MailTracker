"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./schemas/email.schema");
let EmailsService = EmailsService_1 = class EmailsService {
    constructor(emailModel) {
        this.emailModel = emailModel;
        this.logger = new common_1.Logger(EmailsService_1.name);
    }
    async create(createEmailDto) {
        try {
            const email = new this.emailModel({
                ...createEmailDto,
                processed: true,
                timestamp: new Date(),
            });
            const savedEmail = await email.save();
            this.logger.log(`Email created with ID: ${savedEmail._id}`);
            return this.mapToResponseDto(savedEmail);
        }
        catch (error) {
            this.logger.error('Failed to create email:', error);
            throw error;
        }
    }
    async getLatest() {
        try {
            const email = await this.emailModel
                .findOne({ processed: true })
                .sort({ timestamp: -1 })
                .exec();
            if (!email) {
                throw new common_1.NotFoundException('No processed emails found');
            }
            return this.mapToResponseDto(email);
        }
        catch (error) {
            this.logger.error('Failed to get latest email:', error);
            throw error;
        }
    }
    async getHistory(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [emails, total] = await Promise.all([
                this.emailModel
                    .find({ processed: true })
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.emailModel.countDocuments({ processed: true }).exec(),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                emails: emails.map(email => this.mapToResponseDto(email)),
                total,
                page,
                totalPages,
            };
        }
        catch (error) {
            this.logger.error('Failed to get email history:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const email = await this.emailModel.findById(id).exec();
            if (!email) {
                throw new common_1.NotFoundException(`Email with ID ${id} not found`);
            }
            return this.mapToResponseDto(email);
        }
        catch (error) {
            this.logger.error(`Failed to find email with ID ${id}:`, error);
            throw error;
        }
    }
    async findByEspType(espType) {
        try {
            const emails = await this.emailModel
                .find({
                espType: { $regex: espType, $options: 'i' },
                processed: true
            })
                .sort({ timestamp: -1 })
                .exec();
            return emails.map(email => this.mapToResponseDto(email));
        }
        catch (error) {
            this.logger.error(`Failed to find emails by ESP type ${espType}:`, error);
            throw error;
        }
    }
    async getStats() {
        try {
            const [totalEmails, espTypeStats, recentActivity] = await Promise.all([
                this.emailModel.countDocuments({ processed: true }).exec(),
                this.emailModel.aggregate([
                    { $match: { processed: true } },
                    { $group: { _id: '$espType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]).exec(),
                this.emailModel.aggregate([
                    { $match: { processed: true } },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 7 },
                ]).exec(),
            ]);
            const espTypes = espTypeStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});
            return {
                totalEmails,
                espTypes,
                recentActivity: recentActivity.map(item => ({
                    date: item._id,
                    count: item.count,
                })),
            };
        }
        catch (error) {
            this.logger.error('Failed to get email statistics:', error);
            throw error;
        }
    }
    async refreshEmails() {
        try {
            this.logger.log('Starting manual email refresh from IMAP');
            return {
                message: 'IMAP monitoring is active; manual refresh not required',
                newEmailsCount: 0,
            };
        }
        catch (error) {
            this.logger.error('Failed to refresh emails from IMAP:', error);
            throw error;
        }
    }
    mapToResponseDto(email) {
        return {
            id: email._id.toString(),
            rawHeaders: email.rawHeaders,
            receivingChain: email.receivingChain,
            espType: email.espType,
            timestamp: email.timestamp.toISOString(),
            subject: email.subject,
            from: email.from,
            to: email.to,
            receivedAt: email.receivedAt?.toISOString(),
            senderIp: email.senderIp,
            errorMessage: email.errorMessage,
        };
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = EmailsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailsService);
//# sourceMappingURL=emails.service.js.map