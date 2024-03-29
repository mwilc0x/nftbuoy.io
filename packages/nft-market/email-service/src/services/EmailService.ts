import nodemailer from 'nodemailer';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;

export default class EmailService {
    oauth2Client;
    transporter;

    constructor() {
        this.oauth2Client = new OAuth2(
            process.env.EMAIL_SERVICE_GOOGLE_CLIENT_ID,
            process.env.EMAIL_SERVICE_GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );
        
        this.oauth2Client.setCredentials({
            refresh_token: process.env.EMAIL_SERVICE_GMAIL_OAUTH_REFRESH_TOKEN
        });
    }

    getAccessToken = async () => {
        return new Promise((resolve, reject) => {
            try {
                this.oauth2Client.getAccessToken((error, token) => {
                    if (error) {
                        console.log('Failed to retrieve access token.', error);
                        reject(error);
                        return;
                    }
                    resolve(token);
                });
            } catch (error) {
                console.log('Error retrieving access token', error);
                reject(error);
                return;
            }
        });
    }

    createTransporter = async (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                const accessToken = await this.getAccessToken().catch(error => {
                    reject(error);
                    return;
                });

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                      type: 'OAuth2',
                      accessToken,
                      // user: process.env.EMAIL_SERVICE_EMAIL_ACCOUNT_USER,
                      clientId: process.env.EMAIL_SERVICE_GOOGLE_CLIENT_ID,
                      clientSecret: process.env.EMAIL_SERVICE_GOOGLE_CLIENT_SECRET,
                      refreshToken: process.env.EMAIL_SERVICE_GMAIL_OAUTH_REFRESH_TOKEN
                    }
                  });

                  resolve(transporter);
                  // return;
            } catch (error) {
                console.log('Error creating the email transporter', error);
                reject(error);
                return;
            }
        });
    }

    sendEmailAsync = async (options) => {
        return new Promise((resolve, reject) => {
            try {
                this.transporter.sendMail(options, function(error, success) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
            } catch (error) {
                console.log('Error in send email async', error);
                reject(error);
            }
        });
    }

    sendEmail = async (options) => {
        return new Promise(async (resolve, reject) => {
            try {
                this.transporter = await this.createTransporter().catch(error => {
                    reject(error);
                    return;
                });
                
                await this.sendEmailAsync(options).catch(error => {
                    reject(error);
                    return;
                });

                resolve(true);
            } catch (error) {
                reject(error);
                return;
            }
        });
    }
}
