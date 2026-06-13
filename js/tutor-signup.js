const tutorSignupForm = document.getElementById("tutorSignupForm");
const tutorConfirmationBox = document.getElementById("tutorConfirmationBox");
const tutorConfirmationText = document.getElementById("tutorConfirmationText");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyk-4fevx7UET7cwq-bEWhCiFFRLZomPwt-7rmlqjCuJgEQLv0eMLWjR5HwJ2Kry7i52A/exec";

tutorSignupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const tutorId = generateTutorId();

  const tutorProfile = {
    type: "tutor",
    tutorId,
    fullName: document.getElementById("fullName").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    email: document.getElementById("email").value.trim(),
    telegramUsername: document.getElementById("telegramUsername").value.trim(),
    gender: document.getElementById("gender").value,
    age: document.getElementById("age").value,
    qualification: document.getElementById("qualification").value,
    experience: document.getElementById("experience").value,
    subjects: document.getElementById("subjects").value,
    levels: document.getElementById("levels").value,
    preferredAreas: document.getElementById("preferredAreas").value.trim(),
    availabilityPeriod: getSelectedAvailabilityPeriods(),
    specificAvailability: document.getElementById("specificAvailability").value.trim(),
    expectedRate: document.getElementById("expectedRate").value.trim(),
    shortBio: document.getElementById("shortBio").value.trim(),
    status: "REGISTERED",
    createdAt: new Date().toISOString()
  };

  StorageManager.add("tutors", tutorProfile);
  
  sendToGoogleSheet(tutorProfile);

  tutorConfirmationText.textContent =
    `Thank you, ${tutorProfile.fullName}. Your Tutor ID is ${tutorId}. Please keep this ID for future reference.`;

  tutorConfirmationBox.classList.remove("hidden");
  tutorSignupForm.reset();

  tutorConfirmationBox.scrollIntoView({ behavior: "smooth" });
});

function getSelectedAvailabilityPeriods() {
  const selectedPeriods = document.querySelectorAll(
    'input[name="availabilityPeriod"]:checked'
  );

  return Array.from(selectedPeriods)
    .map((period) => period.value)
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