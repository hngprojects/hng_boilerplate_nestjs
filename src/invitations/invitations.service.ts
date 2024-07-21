import { Injectable, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InvitationsService {
  [x: string]: any;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async sendInvitations(emails: string[], orgId: string, adminId: string) {
    // Validate emails
    for (const email of emails) {
      const isValid = await this.validateEmail(email);
      if (!isValid) {
        throw new BadRequestException(`Invalid email address: ${email}`);
      }
    }

    // Check if admin has rights
    const hasAdminRights = await this.checkAdminRights(adminId, orgId);
    if (!hasAdminRights) {
      throw new ForbiddenException('You do not have admin rights for this organization');
    }

    // Send invitations
    const invitations = [];
    for (const email of emails) {
      const token = this.jwtService.sign({ email, orgId }, { expiresIn: '7d' });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      invitations.push({ email, organization: 'My Organization', expires_at: expiresAt.toISOString() });

      // Send email
      console.log(token);

      await this.sendEmail(email, token);
    }

    return invitations;
  }

  private async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkAdminRights(adminId: string, orgId: string): Promise<boolean> {
    // Dummy admin rights check (replace with actual check)
    return true;
  }

  private async sendEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Organization Invitation',
      text: `You are invited to join the organization. Click the link to accept the invitation: http://example.com/invite?token=${token}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
