const express = require("express");
const submitForm = require("./formSubmit");
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Track last submission to prevent duplicates
let lastSubmissionKey = null;
let isCurrentlyRunning = false;

// Function to check if current time matches schedule (Tuesdays and Thursdays at exactly 1:00-1:04 PM)
function isScheduledTime() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    const hour = now.getHours(); // 0-23
    const minute = now.getMinutes(); // 0-59

    // Check if it's Tuesday (2) or Thursday (4), hour is 13 (1pm), and minute is 0-4 (1:00-1:04 PM)
    const isCorrectDay = dayOfWeek === 2 || dayOfWeek === 4; // Tuesday or Thursday
    const isCorrectHour = hour === 13; // 1pm (13:00)
    const isCorrectMinute = minute >= 0 && minute <= 20; // First 5 minutes of 1pm

    return isCorrectDay && isCorrectHour && isCorrectMinute;
}

// Function to generate a unique key for each scheduled time slot
function getScheduleKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dayName = getCurrentDayName();

    return `${year}-${month}-${day}-${dayName}-13:00`;
}

// Function to check if we've already submitted for this time slot
function hasAlreadySubmitted() {
    const currentKey = getScheduleKey();
    return lastSubmissionKey === currentKey;
}

// Function to get current day name for logging
function getCurrentDayName() {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days[new Date().getDay()];
}

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Main trigger endpoint
app.get("/", async (req, res) => {
    const startTime = new Date();
    const currentDay = getCurrentDayName();
    const currentHour = startTime.getHours();
    const currentMinute = startTime.getMinutes();

    console.log(
        `Ping received at ${startTime.toISOString()} (${currentDay}, ${currentHour}:${String(currentMinute).padStart(2, "0")})`,
    );

    // Check if it's the scheduled time
    if (!isScheduledTime()) {
        console.log(
            `⏰ Skipping form submission - not scheduled time. Current: ${currentDay} ${currentHour}:${String(currentMinute).padStart(2, "0")}, Required: Tuesday/Thursday 13:00-13:20`,
        );
        res.json({
            status: "skipped",
            message: `Form submission skipped - not scheduled time. Current: ${currentDay} ${currentHour}:${String(currentMinute).padStart(2, "0")}`,
            nextSchedule: "Next submission: Tuesday/Thursday at 1:00-1:04 PM",
            timestamp: startTime.toISOString(),
        });
        return;
    }

    // Check if already submitted for this time slot
    if (hasAlreadySubmitted()) {
        console.log(
            `🔒 Already submitted for this time slot: ${getScheduleKey()}`,
        );
        res.json({
            status: "already_submitted",
            message: `Form already submitted for this time slot: ${getScheduleKey()}`,
            timestamp: startTime.toISOString(),
        });
        return;
    }

    // Check if currently running to prevent overlapping submissions
    if (isCurrentlyRunning) {
        console.log(`🔄 Form submission already in progress...`);
        res.json({
            status: "in_progress",
            message: "Form submission already in progress",
            timestamp: startTime.toISOString(),
        });
        return;
    }

    console.log(
        `✅ Scheduled time matched! Proceeding with form submission for ${getScheduleKey()}...`,
    );

    try {
        // Mark as running and record the submission key
        isCurrentlyRunning = true;
        lastSubmissionKey = getScheduleKey();

        res.json({
            status: "success",
            message: "Form submission started (scheduled time)",
            scheduleKey: lastSubmissionKey,
            timestamp: startTime.toISOString(),
        });

        // Run the form submission in the background
        await submitForm();

        const endTime = new Date();
        const duration = endTime - startTime;
        console.log(
            `✅ Form submission completed successfully in ${duration}ms for ${lastSubmissionKey}`,
        );
    } catch (err) {
        console.error("❌ Error running form submission:", err);
        // Reset the submission key on error so it can be retried
        lastSubmissionKey = null;
    } finally {
        // Always reset the running flag
        isCurrentlyRunning = false;
    }
});

// Alternative trigger endpoint (in case you want a different URL)
app.get("/submit", async (req, res) => {
    const startTime = new Date();
    const currentDay = getCurrentDayName();
    const currentHour = startTime.getHours();
    const currentMinute = startTime.getMinutes();

    console.log(
        `Submit endpoint triggered at ${startTime.toISOString()} (${currentDay}, ${currentHour}:${String(currentMinute).padStart(2, "0")})`,
    );

    // Check if it's the scheduled time
    if (!isScheduledTime()) {
        console.log(
            `⏰ Skipping form submission - not scheduled time. Current: ${currentDay} ${currentHour}:${String(currentMinute).padStart(2, "0")}, Required: Tuesday/Thursday 13:00-13:20`,
        );
        res.json({
            status: "skipped",
            message: `Form submission skipped - not scheduled time. Current: ${currentDay} ${currentHour}:${String(currentMinute).padStart(2, "0")}`,
            nextSchedule: "Next submission: Tuesday/Thursday at 1:00-1:04 PM",
            timestamp: startTime.toISOString(),
        });
        return;
    }

    // Check if already submitted for this time slot
    if (hasAlreadySubmitted()) {
        console.log(
            `🔒 Already submitted for this time slot: ${getScheduleKey()}`,
        );
        res.json({
            status: "already_submitted",
            message: `Form already submitted for this time slot: ${getScheduleKey()}`,
            timestamp: startTime.toISOString(),
        });
        return;
    }

    // Check if currently running to prevent overlapping submissions
    if (isCurrentlyRunning) {
        console.log(`🔄 Form submission already in progress...`);
        res.json({
            status: "in_progress",
            message: "Form submission already in progress",
            timestamp: startTime.toISOString(),
        });
        return;
    }

    console.log(
        `✅ Scheduled time matched! Proceeding with form submission for ${getScheduleKey()}...`,
    );

    try {
        // Mark as running and record the submission key
        isCurrentlyRunning = true;
        lastSubmissionKey = getScheduleKey();

        await submitForm();

        const endTime = new Date();
        const duration = endTime - startTime;

        res.json({
            status: "success",
            message: "Form submitted successfully (scheduled time)",
            scheduleKey: lastSubmissionKey,
            duration: `${duration}ms`,
            timestamp: endTime.toISOString(),
        });

        console.log(
            `✅ Form submission completed successfully in ${duration}ms for ${lastSubmissionKey}`,
        );
    } catch (err) {
        console.error("❌ Error running form submission:", err);
        // Reset the submission key on error so it can be retried
        lastSubmissionKey = null;
        res.status(500).json({
            status: "error",
            message: "Form submission failed",
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    } finally {
        // Always reset the running flag
        isCurrentlyRunning = false;
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on 0.0.0.0:${port}`);
    console.log(`📝 Form submission endpoint: http://0.0.0.0:${port}/`);
    console.log(`🏥 Health check: http://0.0.0.0:${port}/health`);
});
