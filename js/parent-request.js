const parentRequestForm = document.getElementById("parentRequestForm");
const confirmationBox = document.getElementById("confirmationBox");
const confirmationText = document.getElementById("confirmationText");
const telegramMessageBox = document.getElementById("telegramMessage");
const copyTelegramMessageBtn = document.getElementById("copyTelegramMessage");

parentRequestForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const jobId = generateJobId();

  const parentRequest = {
    jobId,
    parentName: document.getElementById("parentName").value.trim(),
    whatsappNumber: document.getElementById("whatsappNumber").value.trim(),
    studentLevel: document.getElementById("studentLevel").value,
    subjects: document.getElementById("subjects").value.trim(),
    lessonMode: document.getElementById("lessonMode").value,
    area: document.getElementById("area").value.trim(),
    preferredGender: document.getElementById("preferredGender").value,
    qualification: document.getElementById("qualification").value,
    preferredTiming: document.getElementById("preferredTiming").value.trim(),
    budget: document.getElementById("budget").value.trim(),
    remarks: document.getElementById("remarks").value.trim(),
    status: "REQUEST_RECEIVED",
    createdAt: new Date().toISOString()
  };

  StorageManager.add("parentRequests", parentRequest);

  const telegramMessage = generateTelegramMessage(parentRequest);

  confirmationText.textContent =
    `Thank you, ${parentRequest.parentName}. Your request has been saved with Job ID: ${jobId}.`;

  telegramMessageBox.value = telegramMessage;

  confirmationBox.classList.remove("hidden");
  parentRequestForm.reset();

  confirmationBox.scrollIntoView({ behavior: "smooth" });
});

copyTelegramMessageBtn.addEventListener("click", function () {
  navigator.clipboard.writeText(telegramMessageBox.value)
    .then(() => {
      copyTelegramMessageBtn.textContent = "Copied!";
      setTimeout(() => {
        copyTelegramMessageBtn.textContent = "Copy Telegram Message";
      }, 1500);
    })
    .catch(() => {
      alert("Unable to copy message. Please copy it manually.");
    });
});

function generateTelegramMessage(request) {
  const applicationLink = `apply-job.html?jobId=${request.jobId}`;

  return `📚 New Tuition Assignment

Job ID: ${request.jobId}

Subject(s): ${request.subjects}
Student Level: ${request.studentLevel}
Lesson Mode: ${request.lessonMode}
Area: ${request.area}
Preferred Tutor Gender: ${request.preferredGender}
Preferred Qualification: ${request.qualification}
Preferred Timing: ${request.preferredTiming || "Not specified"}
Budget: ${request.budget || "Not specified"}

Remarks:
${request.remarks || "No additional remarks."}

Registered tutors may apply here:
${applicationLink}

Note: Selection is not guaranteed and depends on the parent's final decision.`;
}