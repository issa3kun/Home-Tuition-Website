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
    subjects: getSelectedOptions("subjects"),
    lessonMode: document.getElementById("lessonMode").value,
    area: document.getElementById("area").value.trim(),
    preferredGender: document.getElementById("preferredGender").value,
    qualification: document.getElementById("qualification").value,
    preferredTimingPeriod: getSelectedTimingPeriods(),
    specificTiming: document.getElementById("specificTiming").value.trim(),
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

function getSelectedTimingPeriods() {
  const selectedPeriods = document.querySelectorAll(
    'input[name="preferredTimingPeriod"]:checked'
  );

  return Array.from(selectedPeriods)
    .map((period) => period.value)
    .join(", ");
}

function generateTelegramMessage(request) {
  return `📚 New Tuition Assignment

Job ID: ${request.jobId}

Subject: ${request.subjects}
Student Level: ${request.studentLevel}
Lesson Mode: ${request.lessonMode}
Area: ${request.area}
Preferred Tutor Gender: ${request.preferredGender}
Preferred Qualification: ${request.qualification}
Preferred Timing: ${request.preferredTimingPeriod || "Not specified"} (${request.specificTiming || "No specific time mentioned"})
Budget: ${request.budget || "Not specified"}

Remarks:
${request.remarks || "No additional remarks."}

Note: Selection is not guaranteed and depends on the parent's final decision.`;
}

function getSelectedOptions(selectId) {
  const selectedOptions = document.getElementById(selectId).selectedOptions;

  return Array.from(selectedOptions)
    .map((option) => option.value)
    .join(", ");
}
function initializeTagSelects() {
  const wrappers = document.querySelectorAll(".tag-select-wrapper");

  wrappers.forEach((wrapper) => {
    const inputId = wrapper.dataset.inputId;
    const hiddenInput = document.getElementById(inputId);
    const display = wrapper.querySelector(".tag-select-display");
    const selectedTagsContainer = wrapper.querySelector(".selected-tags");
    const toggleButton = wrapper.querySelector(".tag-select-toggle");
    const menu = wrapper.querySelector(".tag-select-menu");
    const searchInput = wrapper.querySelector(".tag-search");
    const options = wrapper.querySelectorAll(".tag-option");

    let selectedValues = [];

    function updateHiddenInput() {
      hiddenInput.value = selectedValues.join(", ");
    }

    function renderTags() {
      selectedTagsContainer.innerHTML = "";

      selectedValues.forEach((value) => {
        const tag = document.createElement("span");
        tag.className = "subject-tag";
        tag.innerHTML = `
          ${value}
          <button type="button" aria-label="Remove ${value}">×</button>
        `;

        tag.querySelector("button").addEventListener("click", function (event) {
          event.stopPropagation();
          selectedValues = selectedValues.filter((item) => item !== value);

          options.forEach((option) => {
            if (option.dataset.value === value) {
              option.classList.remove("selected");
            }
          });

          renderTags();
          updateHiddenInput();
        });

        selectedTagsContainer.appendChild(tag);
      });
    }

    function closeOtherMenus() {
      document.querySelectorAll(".tag-select-menu").forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.classList.add("hidden");
        }
      });
    }

    display.addEventListener("click", function () {
      closeOtherMenus();
      menu.classList.toggle("hidden");
      searchInput.focus();
    });

    toggleButton.addEventListener("click", function (event) {
      event.stopPropagation();
      closeOtherMenus();
      menu.classList.toggle("hidden");
      searchInput.focus();
    });

    options.forEach((option) => {
      option.addEventListener("click", function () {
        const value = option.dataset.value;

        if (selectedValues.includes(value)) {
          selectedValues = selectedValues.filter((item) => item !== value);
          option.classList.remove("selected");
        } else {
          selectedValues.push(value);
          option.classList.add("selected");
        }

        renderTags();
        updateHiddenInput();
      });
    });

    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();

      options.forEach((option) => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? "block" : "none";
      });
    });

    document.addEventListener("click", function (event) {
      if (!wrapper.contains(event.target)) {
        menu.classList.add("hidden");
      }
    });
  });
}

initializeTagSelects();