/**
 * Local Lead Finder - Reply Watcher (Google Apps Script)
 *
 * Runs in YOUR Google account and keeps your outreach clean automatically. Every 15
 * minutes it scans your Gmail for new replies and updates that lead's Status in your
 * Leads tab, so the outreach knows to stop:
 *   - A normal reply           -> Status "Replied"  (they are talking to you now)
 *   - A "remove me" type reply  -> Status "Removed"  (they asked to be taken off)
 * Either way they get no more emails. No Make, no app password, no extra services.
 *
 * SETUP (about 2 minutes, one time):
 *   1. Open your Leads Google Sheet.
 *   2. Extensions > Apps Script.
 *   3. Delete anything in the editor, paste this whole file, and click Save.
 *   4. In the function dropdown pick "installReplyWatcher", click Run, and approve
 *      the permissions Google asks for (it needs to read your Gmail and edit this
 *      sheet). That checks your replies now and keeps checking every 15 minutes.
 *
 * To confirm it works (30 seconds): add a test row to your Leads tab with a spare
 * email of yours and the Status "Contacted". From that spare address, reply with
 * "please remove me". Within 15 minutes (or run "checkReplies" by hand) the row flips
 * to "Removed". Delete the test row after.
 */

// The Leads tab layout the scraper writes (row 1 title, row 2 headings, data row 3+).
var LEADS_TAB = 'Leads';
var EMAIL_COL = 6;    // column F = email
var STATUS_COL = 20;  // column T = status
var HEADER_ROWS = 2;  // title row + heading row above the data
// Statuses that are still being chased, so a reply from one of these should stop it.
var ACTIVE_STATUSES = [
  'Contacted', 'Follow-up 1', 'Follow-up 2', 'Follow-up 3', 'Follow-up 4',
  'Follow-up 5', 'Nurturing'
];
// How far back to look for replies each run. Wider than the 15-minute cadence so a
// reply is still caught if the trigger was paused for a day or two.
var LOOKBACK = 'newer_than:7d';
// If a reply contains any of these, treat it as "take me off the list" -> Removed.
var OPTOUT_PHRASES = [
  'unsubscribe', 'remove me', 'take me off', 'opt out', 'opt-out', 'stop emailing',
  'stop contacting', 'stop sending', 'do not contact', 'don\'t contact',
  'do not email', 'don\'t email', 'leave me alone', 'not interested', 'no thanks',
  'no thank you', 'please stop', 'take me off your list'
];

/** True if the reply text reads like a request to be removed from the list. */
function looksLikeOptOut(text) {
  var t = String(text || '').toLowerCase();
  for (var i = 0; i < OPTOUT_PHRASES.length; i++) {
    if (t.indexOf(OPTOUT_PHRASES[i]) !== -1) return true;
  }
  return false;
}

/** Run this ONCE to switch the watcher on. Checks now, then every 15 minutes. */
function installReplyWatcher() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkReplies') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkReplies').timeBased().everyMinutes(15).create();
  checkReplies();
}

/** The worker: mark any lead who has emailed us back as Replied, or Removed if they
 *  asked to be taken off. */
function checkReplies() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(LEADS_TAB) || ss.getSheets()[0]; // fall back to first tab
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  var count = lastRow - HEADER_ROWS;
  if (count < 1) return;

  // Map each still-being-chased lead's email to the row(s) it sits on.
  var emails = sheet.getRange(HEADER_ROWS + 1, EMAIL_COL, count, 1).getValues();
  var statuses = sheet.getRange(HEADER_ROWS + 1, STATUS_COL, count, 1).getValues();
  var rowsByEmail = {};
  for (var i = 0; i < count; i++) {
    var email = String(emails[i][0]).trim().toLowerCase();
    var status = String(statuses[i][0]).trim();
    if (email && ACTIVE_STATUSES.indexOf(status) !== -1) {
      if (!rowsByEmail[email]) rowsByEmail[email] = [];
      rowsByEmail[email].push(HEADER_ROWS + 1 + i);
    }
  }
  if (Object.keys(rowsByEmail).length === 0) return;

  // Scan recent inbox threads; if a message is from a lead we are chasing, flip it.
  var threads = GmailApp.search('in:inbox ' + LOOKBACK, 0, 50);
  for (var t = 0; t < threads.length; t++) {
    var messages = threads[t].getMessages();
    for (var m = 0; m < messages.length; m++) {
      var from = messages[m].getFrom().toLowerCase(); // "Name <email@x.com>" or "email@x.com"
      for (var leadEmail in rowsByEmail) {
        if (from.indexOf(leadEmail) !== -1) {
          var newStatus = looksLikeOptOut(messages[m].getPlainBody()) ? 'Removed' : 'Replied';
          rowsByEmail[leadEmail].forEach(function (row) {
            sheet.getRange(row, STATUS_COL).setValue(newStatus);
          });
          delete rowsByEmail[leadEmail]; // done with this lead
        }
      }
    }
  }
}
