/**
 * Where RSVPs and questions from the site end up.
 *
 * The site POSTs JSON here (see src/components/site/actions.ts). This script:
 *   - adds each RSVP to the "RSVPs" tab of this spreadsheet, one row per guest
 *   - saves any wedding photo to a Drive folder called "Wedding RSVP photos" and links it in the row
 *   - emails each question from the FAQ page to NOTIFY, with Reply going to the guest
 *   - emails NOTIFY a short note for each RSVP, so nothing needs checking by hand
 *
 * Setup (about five minutes):
 *   1. Create a Google Sheet while signed in as g.a.walterswedding@gmail.com.
 *      Extensions → Apps Script, delete what's there, and paste in this file.
 *   2. Project Settings (the gear) → Script properties → Add property:
 *      SECRET = any long random string (keep it; the site needs the same one).
 *   3. Deploy → New deployment → type "Web app".
 *      Execute as: Me. Who has access: Anyone. Deploy, and allow the permissions it asks for.
 *   4. Copy the web app URL. Where the site runs, set these environment variables and restart it:
 *        RSVP_WEBHOOK_URL=<the web app URL>
 *        RSVP_WEBHOOK_SECRET=<the same SECRET>
 *   After editing this script later: Deploy → Manage deployments → edit → Version: New version.
 */

const NOTIFY = "g.a.walterswedding@gmail.com";
const PHOTO_FOLDER = "Wedding RSVP photos";
const HEADERS = ["Received", "Invitation", "Guest", "Attending", "Plus one of", "Email", "Dietary", "Wedding song", "Wedding photo", "Note"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || data.secret !== secret) return reply({ ok: false, error: "unauthorized" });
    if (data.type === "rsvp") saveRsvp(data);
    else if (data.type === "question") sendQuestion(data);
    else return reply({ ok: false, error: "unknown type" });
    return reply({ ok: true });
  } catch (error) {
    console.error(error);
    return reply({ ok: false, error: String(error) });
  }
}

function saveRsvp(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = tab("RSVPs");
    const photo = data.photo ? savePhoto(data) : "";
    const received = new Date(data.receivedAt || Date.now());
    data.replies.forEach(guest => {
      sheet.appendRow([received, data.invitation, guest.guest, guest.attending === "yes" ? "Yes" : "No", guest.plusOneOf || "", data.email, data.dietary, data.song, photo, data.note]);
    });
  } finally {
    lock.releaseLock();
  }
  const lines = data.replies.map(guest => `${guest.guest}: ${guest.attending === "yes" ? "coming" : "not coming"}${guest.plusOneOf ? " (plus one)" : ""}`);
  MailApp.sendEmail({
    to: NOTIFY,
    replyTo: data.email,
    subject: `RSVP: ${data.invitation}`,
    body: [...lines, "", data.dietary && `Dietary: ${data.dietary}`, data.song && `Wedding song: ${data.song}`, data.note && `Note: ${data.note}`, data.photo ? "They sent a wedding photo (linked in the sheet)." : ""].filter(Boolean).join("\n"),
  });
}

function savePhoto(data) {
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(PHOTO_FOLDER);
  const blob = Utilities.newBlob(Utilities.base64Decode(data.photo.data), data.photo.type, `${data.invitation} - ${data.photo.name}`);
  return folder.createFile(blob).getUrl();
}

function sendQuestion(data) {
  tab("Questions", ["Received", "Name", "Email", "Question"]).appendRow([new Date(data.receivedAt || Date.now()), data.name, data.email, data.question]);
  MailApp.sendEmail({ to: NOTIFY, replyTo: data.email, subject: `Wedding question from ${data.name}`, body: `${data.question}\n\n${data.name} (${data.email})` });
}

// The named tab, made with a bold header row the first time.
function tab(name, headers = HEADERS) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

const reply = body => ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
