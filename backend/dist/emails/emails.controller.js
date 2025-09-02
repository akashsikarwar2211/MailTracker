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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const emails_service_1 = require("./emails.service");
const create_email_dto_1 = require("./dto/create-email.dto");
let EmailsController = class EmailsController {
    constructor(emailsService) {
        this.emailsService = emailsService;
    }
    async receiveEmail(createEmailDto) {
        const email = await this.emailsService.create(createEmailDto);
        return {
            success: true,
            data: email,
        };
    }
    async getLatest() {
        const email = await this.emailsService.getLatest();
        return {
            success: true,
            data: email,
        };
    }
    async getHistory(page = '1', limit = '10') {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const history = await this.emailsService.getHistory(pageNum, limitNum);
        return {
            success: true,
            data: history,
        };
    }
    async getById(id) {
        const email = await this.emailsService.findById(id);
        return {
            success: true,
            data: email,
        };
    }
    async getByEspType(type) {
        const emails = await this.emailsService.findByEspType(type);
        return {
            success: true,
            data: emails,
        };
    }
    async getDashboardStats() {
        const stats = await this.emailsService.getStats();
        return {
            success: true,
            data: stats,
        };
    }
    async refreshEmails() {
        const result = await this.emailsService.refreshEmails();
        return {
            success: true,
            data: result,
        };
    }
    async getLatestHeaders() {
        const email = await this.emailsService.getLatest();
        return {
            success: true,
            data: {
                rawHeaders: email.rawHeaders,
                senderIp: email.senderIp,
                receivingChain: email.receivingChain,
            },
        };
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Post)('receive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_dto_1.CreateEmailDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "receiveEmail", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)('esp/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getByEspType", null);
__decorate([
    (0, common_1.Get)('stats/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "refreshEmails", null);
__decorate([
    (0, common_1.Get)('debug/latest-headers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getLatestHeaders", null);
exports.EmailsController = EmailsController = __decorate([
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [emails_service_1.EmailsService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map