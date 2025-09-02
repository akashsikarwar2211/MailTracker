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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSchema = exports.Email = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Email = class Email {
};
exports.Email = Email;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Email.prototype, "rawHeaders", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String], default: [] }),
    __metadata("design:type", Array)
], Email.prototype, "receivingChain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Email.prototype, "espType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Email.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Email.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Email.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Email.prototype, "to", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], Email.prototype, "receivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Email.prototype, "senderIp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Email.prototype, "processed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Email.prototype, "errorMessage", void 0);
exports.Email = Email = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'emails',
    })
], Email);
exports.EmailSchema = mongoose_1.SchemaFactory.createForClass(Email);
exports.EmailSchema.index({ timestamp: -1 });
exports.EmailSchema.index({ espType: 1 });
exports.EmailSchema.index({ processed: 1 });
exports.EmailSchema.index({ 'receivingChain.server': 1 });
//# sourceMappingURL=email.schema.js.map