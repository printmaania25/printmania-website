// utils/whatsappMessenger.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. 91800xxxxxxx (E.164 without +)

if (!token || !phoneNumberId) {
  console.warn("WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in env");
}

/**
 * Send a simple text message
 * @param {string} to - E.164 phone number without '+' (e.g. 91800xxxxxxx)
 * @param {string} text
 */
export async function sendText(to, text) {
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await axios.post(url, payload, { headers });
  return res.data;
}

/**
 * Send an image by public link (Cloudinary link or any public URL)
 * @param {string} to - E.164 without '+' (e.g. 91800xxxxx)
 * @param {string} link - public URL to image
 * @param {string} caption - optional caption
 */
export async function sendImageByLink(to, link, caption = "") {
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: {
      link,
      caption,
    },
  };
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await axios.post(url, payload, { headers });
  return res.data;
}

/**
 * Send multiple images (sends one message per image)
 * @param {string} to - E.164 without '+'
 * @param {string[]} links - array of public image URLs (Cloudinary)
 * @param {string} captionPrefix - optional text prefix for each image caption
 */
export async function sendMultipleImages(to, links = [], captionPrefix = "") {
  if (!Array.isArray(links) || links.length === 0) return [];

  // send each image as a separate message
  const promises = links.map((link, idx) =>
    sendImageByLink(to, link, captionPrefix ? `${captionPrefix} (${idx + 1})` : "")
      .catch((err) => {
        console.error("sendImageByLink failed for", link, err.response?.data || err.message);
        return { error: true, link, message: err.message, details: err.response?.data || null };
      })
  );

  const results = await Promise.all(promises);
  return results;
}

/**
 * Helper to send to admin
 */
export async function sendTextToAdmin(text) {
  if (!adminWhatsApp) {
    console.warn("ADMIN_WHATSAPP_NUMBER not set, skipping admin whatsapp");
    return null;
  }
  return sendText(adminWhatsApp, text);
}

export async function sendImagesToAdmin(links = [], captionPrefix = "") {
  if (!adminWhatsApp) {
    console.warn("ADMIN_WHATSAPP_NUMBER not set, skipping admin whatsapp images");
    return [];
  }
  return sendMultipleImages(adminWhatsApp, links, captionPrefix);
}
