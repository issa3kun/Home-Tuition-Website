const tutorSignupForm = document.getElementById("tutorSignupForm");
const tutorConfirmationBox = document.getElementById("tutorConfirmationBox");
const tutorConfirmationText = document.getElementById("tutorConfirmationText");

tutorSignupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const tutorId = generateTutorId();

  const tutorProfile = {
    tutorId,
    fullName: document.getElementById("fullName").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    email: document.getElementById("email").value.trim(),
    telegramUsername: document.getElementById("telegramUsername").value.trim(),
    gender: document.getElementById("gender").value,
    age: document.getElementById("age").value,
    qualification: document.getElementById("qualification").value,
    experience: document.getElementById("experience").value,
    subjects: document.getElementById("subjects").value.trim(),
    levels: document.getElementById("levels").value.trim(),
    preferredAreas: document.getElementById("preferredAreas").value.trim(),
    availability: document.getElementById("availability").value.trim(),
    expectedRate: document.getElementById("expectedRate").value.trim(),
    shortBio: document.getElementById("shortBio").value.trim(),
    status: "REGISTERED",
    createdAt: new Date().toISOString()
  };

  StorageManager.add("tutors", tutorProfile);

  tutorConfirmationText.textContent =
    `Thank you, ${tutorProfile.fullName}. Your Tutor ID is ${tutorId}. Please keep this ID for future reference.`;

  tutorConfirmationBox.classList.remove("hidden");
  tutorSignupForm.reset();

  tutorConfirmationBox.scrollIntoView({ behavior: "smooth" });
});