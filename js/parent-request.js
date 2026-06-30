const parentRequestForm = document.getElementById("parentRequestForm");
const confirmationBox = document.getElementById("confirmationBox");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk-4fevx7UET7cwq-bEWhCiFFRLZomPwt-7rmlqjCuJgEQLv0eMLWjR5HwJ2Kry7i52A/exec";
const WHATSAPP_NUMBER = "6588010944";

parentRequestForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const jobId = generateJobId();

  const parentRequest = {
    type: "parent",
    jobId,
    parentName: document.getElementById("parentName").value.trim(),
    whatsappNumber: document.getElementById("whatsappNumber").value.trim(),
    studentLevel: document.getElementById("studentLevel").value,
    subjects: document.getElementById("subjects").value,
    lessonMode: document.getElementById("lessonMode").value,
    area: document.getElementById("area").value.trim(),
    preferredGender: document.getElementById("preferredGender").value,
    qualification: document.getElementById("qualification").value,
    preferredTimingPeriod: getSelectedTimingPeriods(),
    specificTiming: document.getElementById("specificTiming").value.trim(),
    budget: formatBudget(document.getElementById("budget").value.trim()),
    remarks: document.getElementById("remarks").value.trim(),
    status: "PENDING_PARENT_CONFIRMATION",
    createdAt: new Date().toISOString()
  };

  if (!parentRequest.subjects) {
    alert("Please select at least one subject.");
    return;
  }

  StorageManager.add("parentRequests", parentRequest);
  await sendToGoogleSheet(parentRequest);

  const whatsappLink = buildWhatsAppLink(parentRequest);

  confirmationBox.innerHTML = `
    <h2>Request Successfully Submitted</h2>
    <p>Your request has been saved. Redirecting you to WhatsApp for confirmation...</p>
    <p>
      <a href="${whatsappLink}" target="_blank" rel="noopener">
        Click here if WhatsApp does not open automatically.
      </a>
    </p>
  `;

  confirmationBox.classList.remove("hidden");

  parentRequestForm.reset();
  clearAllTagSelects();

  confirmationBox.scrollIntoView({ behavior: "smooth" });

  setTimeout(() => {
    window.location.href = whatsappLink;
  }, 1000);
});

function getSelectedTimingPeriods() {
  const selectedPeriods = document.querySelectorAll(
    'input[name="preferredTimingPeriod"]:checked'
  );

  return Array.from(selectedPeriods)
    .map((period) => period.value)
    .join(", ");
}

function formatBudget(budget) {
  if (!budget) {
    return "";
  }

  let cleanedBudget = budget.toString().trim();

  cleanedBudget = cleanedBudget.replaceAll("$", "");
  cleanedBudget = cleanedBudget.replace(/\/hr/gi, "");
  cleanedBudget = cleanedBudget.replace(/\/hour/gi, "");
  cleanedBudget = cleanedBudget.replace(/per hour/gi, "");
  cleanedBudget = cleanedBudget.trim();

  return "$" + cleanedBudget + "/Hr";
}

function buildWhatsAppMessage(request) {
  return `Hi, I would like to confirm my tuition request.

Parent Name: ${request.parentName}
Job ID: ${request.jobId}
Student Level: ${request.studentLevel}
Subject(s): ${request.subjects}
Lesson Mode: ${request.lessonMode}
Address / Postal Code: ${request.area}
Preferred Tutor Gender: ${request.preferredGender}
Preferred Qualification: ${request.qualification}
Preferred Timing: ${request.preferredTimingPeriod || "Not specified"}
Specific Timing: ${request.specificTiming || "Not specified"}
Budget: ${request.budget || "Not specified"}

Remarks:
${request.remarks || "No additional remarks."}`;
}

function buildWhatsAppLink(request) {
  const message = encodeURIComponent(buildWhatsAppMessage(request));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
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

    wrapper.clearTagSelect = function () {
      selectedValues = [];

      options.forEach((option) => {
        option.classList.remove("selected");
        option.style.display = "block";
      });

      searchInput.value = "";
      renderTags();
      updateHiddenInput();
      menu.classList.add("hidden");
    };

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

function clearAllTagSelects() {
  document.querySelectorAll(".tag-select-wrapper").forEach((wrapper) => {
    if (typeof wrapper.clearTagSelect === "function") {
      wrapper.clearTagSelect();
    }
  });
}

function sendToGoogleSheet(data) {
  return fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

initializeTagSelects();