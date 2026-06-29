const parentRequestForm = document.getElementById("parentRequestForm");
const confirmationBox = document.getElementById("confirmationBox");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk-4fevx7UET7cwq-bEWhCiFFRLZomPwt-7rmlqjCuJgEQLv0eMLWjR5HwJ2Kry7i52A/exec";

parentRequestForm.addEventListener("submit", function (event) {
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
    status: "REQUEST_RECEIVED",
    createdAt: new Date().toISOString()
  };

  if (!parentRequest.subjects) {
    alert("Please select at least one subject.");
    return;
  }

  StorageManager.add("parentRequests", parentRequest);
  sendToGoogleSheet(parentRequest);

  confirmationBox.innerHTML = `
    <h2>Request Successfully Submitted</h2>
    <p>Thank you. Your tutor request has been submitted successfully.</p>
  `;

  confirmationBox.classList.remove("hidden");

  parentRequestForm.reset();
  clearAllTagSelects();

  confirmationBox.scrollIntoView({ behavior: "smooth" });
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
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

initializeTagSelects();