import axios from "axios";

export interface NotificationPayload {
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  status: string;
  message: string;
}

export const sendWebhookNotification = async (webhookUrl: string, payload: NotificationPayload) => {
  try {
    const isDiscord = webhookUrl.includes("discord.com");
    const isSlack = webhookUrl.includes("slack.com");

    let body: any = {};

    if (isDiscord) {
      body = {
        embeds: [{
          title: `DevFlow Alert: Developer ${payload.userName} is ${payload.status}`,
          description: payload.message,
          color: payload.status === 'Blocked' ? 0xFF0000 : 0xFFFF00,
          fields: [
            { name: "Project", value: payload.projectName, inline: true },
            { name: "User ID", value: payload.userId, inline: true },
          ],
          timestamp: new Date().toISOString()
        }]
      };
    } else if (isSlack) {
      body = {
        text: `*DevFlow Alert:* Developer *${payload.userName}* is *${payload.status}*\n> ${payload.message}\nProject: ${payload.projectName}`
      };
    } else {
      // Generic JSON webhook
      body = payload;
    }

    await axios.post(webhookUrl, body);
    console.log(`Notification sent to ${webhookUrl}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send webhook notification:", error);
    return { success: false, error: error.message };
  }
};
