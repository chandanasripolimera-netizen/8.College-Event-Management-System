
const STORAGE_KEYS = {
  events: "campusEvents_v1",
  registrations: "campusRegistrations_v1"
};

const categoryIcons = {
  Technology: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Workshop: "🧠",
  Other: "✨"
};

const today = new Date();
const localDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function makeId() {
  return "id-" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function loadData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

const demoEvents = [
  {
    id: "demo-tech",
    name: "TechNova 2026",
    category: "Technology",
    date: dateOffset(4),
    venue: "CSE Block Auditorium",
    capacity: 100,
    description: "Explore coding competitions, innovative projects, robotics and exciting technology challenges."
  },
  {
    id: "demo-cultural",
    name: "Rhythm & Colors",
    category: "Cultural",
    date: dateOffset(8),
    venue: "Main College Stage",
    capacity: 150,
    description: "Celebrate music, dance, art and the amazing creative talents of your college."
  },
  {
    id: "demo-sports",
    name: "Campus Sports League",
    category: "Sports",
    date: dateOffset(12),
    venue: "College Sports Ground",
    capacity: 80,
    description: "Join your friends for a day of team spirit, sports, fitness and friendly competition."
  },
  {
    id: "demo-workshop",
    name: "AI Innovation Lab",
    category: "Workshop",
    date: dateOffset(6),
    venue: "Innovation Centre",
    capacity: 60,
    description: "Discover artificial intelligence through beginner-friendly activities and practical projects."
  },
  {
    id: "demo-cultural2",
    name: "Freshers Celebration",
    category: "Cultural",
    date: dateOffset(16),
    venue: "Open Air Theatre",
    capacity: 120,
    description: "Meet new friends and enjoy performances, games and memorable campus moments."
  },
  {
    id: "demo-tech2",
    name: "Web Design Workshop",
    category: "Technology",
    date: dateOffset(10),
    venue: "Computer Lab 2",
    capacity: 45,
    description: "Learn the basics of creating beautiful websites with HTML, CSS and JavaScript."
  }
];

let events = loadData(STORAGE_KEYS.events, null);
let registrations = loadData(STORAGE_KEYS.registrations, []);

if (!events || events.length === 0) {
  events = demoEvents;
  saveEvents();
}

// Keep only valid registrations associated with existing events.
registrations = registrations.filter(reg =>
  events.some(event => event.id === reg.eventId)
);

function saveEvents() {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

function saveRegistrations() {
  localStorage.setItem(
    STORAGE_KEYS.registrations,
    JSON.stringify(registrations)
  );
}

const $ = id => document.getElementById(id);

let toastTimer;

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(id) {
  $(id).hidden = false;
  document.body.style.overflow = "hidden";

  const firstInput = $(id).querySelector("input:not([type=hidden]), select");
  if (firstInput) firstInput.focus();
}

function closeModal(id) {
  $(id).hidden = true;

  if (document.querySelectorAll(".modal:not([hidden])").length === 0) {
    document.body.style.overflow = "";
  }
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal:not([hidden])").forEach(modal => {
      closeModal(modal.id);
    });
  }
});

function getEvent(id) {
  return events.find(event => event.id === id);
}

function getRegistrations(eventId) {
  return registrations.filter(reg => reg.eventId === eventId);
}

function availableSeats(event) {
  return Math.max(0, event.capacity - getRegistrations(event.id).length);
}

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderStats() {
  $("totalEvents").textContent = events.length;
  $("totalRegistrations").textContent = registrations.length;

  const seats = events.reduce(
    (sum, event) => sum + availableSeats(event), 0
  );

  $("totalSeats").textContent = seats.toLocaleString("en-IN");
}

function renderEvents() {
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const sort = $("sortFilter").value;

  let filtered = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(search) ||
      event.venue.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search);

    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (sort === "seats") return availableSeats(b) - availableSeats(a);
    if (sort === "name") return a.name.localeCompare(b.name);
    return a.date.localeCompare(b.date);
  });

  $("emptyEvents").hidden = filtered.length !== 0;

  $("eventGrid").innerHTML = filtered.map(event => {
    const available = availableSeats(event);
    const count = getRegistrations(event.id).length;
    const percentage = event.capacity
      ? Math.min(100, count / event.capacity * 100)
      : 0;

    const full = available === 0;

    return `
      <article class="event-card">
        <div class="event-cover cover-${escapeHTML(event.category)}">
          <span class="category-pill">
            ${escapeHTML(event.category)}
          </span>
          ${categoryIcons[event.category] || "✨"}
        </div>

        <div class="event-content">
          <h3>${escapeHTML(event.name)}</h3>
          <p class="event-description">
            ${escapeHTML(event.description)}
          </p>

          <div class="event-meta">
            <span>📅 ${formatDate(event.date)}</span>
            <span>📍 ${escapeHTML(event.venue)}</span>
            <span>👥 ${count} registered</span>
          </div>

          <div class="seat-row">
            <span>Seat availability</span>
            <strong>${available} / ${event.capacity} left</strong>
          </div>

          <div class="progress">
            <div class="progress-bar" style="width:${percentage}%"></div>
          </div>

          <div class="event-actions">
            <button class="primary-btn" data-register="${escapeHTML(event.id)}"
              ${full ? "disabled" : ""}>
              ${full ? "Fully Booked" : "Register Now →"}
            </button>
            <button class="outline-btn" data-attendees="${escapeHTML(event.id)}">
              Attendees
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderAttendeeOptions() {
  const select = $("attendeeEventFilter");
  const previous = select.value;

  select.innerHTML = `
    <option value="all">All Events</option>
    ${events.map(event => `
      <option value="${escapeHTML(event.id)}">
        ${escapeHTML(event.name)}
      </option>
    `).join("")}
  `;

  if ([...select.options].some(option => option.value === previous)) {
    select.value = previous;
  }
}

function renderAttendees() {
  const eventId = $("attendeeEventFilter").value || "all";
  const search = $("attendeeSearch").value.trim().toLowerCase();

  const filtered = registrations.filter(reg => {
    const event = getEvent(reg.eventId);

    const matchesEvent = eventId === "all" || reg.eventId === eventId;

    const matchesSearch = [
      reg.name, reg.studentId, reg.email, event?.name || ""
    ].some(value => value.toLowerCase().includes(search));

    return matchesEvent && matchesSearch;
  });

  $("attendeeTable").innerHTML = filtered.length
    ? filtered.map(reg => `
      <tr>
        <td><strong>${escapeHTML(reg.name)}</strong></td>
        <td>${escapeHTML(reg.studentId)}</td>
        <td>${escapeHTML(reg.email)}</td>
        <td>${escapeHTML(reg.registeredOn)}</td>
        <td>
          <button class="remove-btn" data-remove="${escapeHTML(reg.id)}">
            Cancel
          </button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" style="text-align:center;padding:30px">
         No attendee records found.
       </td></tr>`;

  $("attendeeCount").textContent =
    `${filtered.length} attendee${filtered.length === 1 ? "" : "s"}`;
}

function renderAll() {
  renderStats();
  renderEvents();
  renderAttendeeOptions();
  renderAttendees();
}

// Open registration form.
$("eventGrid").addEventListener("click", event => {
  const registerButton = event.target.closest("[data-register]");
  const attendeeButton = event.target.closest("[data-attendees]");

  if (registerButton) {
    const selectedEvent = getEvent(registerButton.dataset.register);
    if (!selectedEvent) return;

    if (availableSeats(selectedEvent) === 0) {
      showToast("Sorry, this event is fully booked.");
      renderAll();
      return;
    }

    $("registrationForm").reset();
    $("registrationEventId").value = selectedEvent.id;
    $("registrationEventName").textContent =
      `${selectedEvent.name} · ${formatDate(selectedEvent.date)}`;
    $("registrationMessage").textContent = "";

    openModal("registrationModal");
  }

  if (attendeeButton) {
    $("attendeeEventFilter").value = attendeeButton.dataset.attendees;
    renderAttendees();
    $("manage").scrollIntoView({ behavior: "smooth" });
  }
});

// Submit a student registration.
$("registrationForm").addEventListener("submit", event => {
  event.preventDefault();

  const eventId = $("registrationEventId").value;
  const selectedEvent = getEvent(eventId);

  const name = $("studentName").value.trim();
  const studentId = $("studentId").value.trim();
  const email = $("studentEmail").value.trim().toLowerCase();

  if (!selectedEvent || !name || !studentId || !email) {
    $("registrationMessage").textContent =
      "Please complete all fields correctly.";
    return;
  }

  if (availableSeats(selectedEvent) <= 0) {
    $("registrationMessage").textContent =
      "Sorry, all seats have been booked.";
    renderAll();
    return;
  }

  const duplicate = registrations.some(reg =>
    reg.eventId === eventId &&
    (
      reg.studentId.toLowerCase() === studentId.toLowerCase() ||
      reg.email.toLowerCase() === email
    )
  );

  if (duplicate) {
    $("registrationMessage").textContent =
      "This student ID or email is already registered for this event.";
    return;
  }

  registrations.push({
    id: makeId(),
    eventId,
    name,
    studentId,
    email,
    registeredOn: localDate(new Date())
  });

  saveRegistrations();
  closeModal("registrationModal");
  renderAll();
  showToast("🎉 Registration successful!");
});

// Create a new event.
function openEventForm() {
  $("eventForm").reset();
  $("eventDate").min = localDate(new Date());
  $("eventDate").value = dateOffset(7);
  openModal("eventModal");
}

$("addEventNav").addEventListener("click", openEventForm);
$("createEventBtn").addEventListener("click", openEventForm);

$("eventForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("eventName").value.trim();
  const category = $("eventCategory").value;
  const date = $("eventDate").value;
  const venue = $("eventVenue").value.trim();
  const capacity = Number($("eventCapacity").value);
  const description = $("eventDescription").value.trim();

  if (!name || !venue || !description || !date) {
    showToast("Please fill in all event details.");
    return;
  }

  if (date < localDate(new Date())) {
    showToast("Choose today or a future date.");
    return;
  }

  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
    showToast("Enter a seat limit between 1 and 10,000.");
    return;
  }

  events.push({
    id: makeId(),
    name,
    category,
    date,
    venue,
    capacity,
    description
  });

  saveEvents();
  closeModal("eventModal");
  renderAll();
  showToast("✨ Your event has been published!");

  $("events").scrollIntoView({ behavior: "smooth" });
});

// Search, category filters and sorting.
$("searchInput").addEventListener("input", renderEvents);
$("categoryFilter").addEventListener("change", renderEvents);
$("sortFilter").addEventListener("change", renderEvents);
$("attendeeEventFilter").addEventListener("change", renderAttendees);
$("attendeeSearch").addEventListener("input", renderAttendees);

// Cancel a registration and release the seat.
$("attendeeTable").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;

  const registration = registrations.find(
    reg => reg.id === button.dataset.remove
  );

  if (!registration) return;

  const confirmed = window.confirm(
    `Cancel registration for ${registration.name}?`
  );

  if (!confirmed) return;

  registrations = registrations.filter(
    reg => reg.id !== registration.id
  );

  saveRegistrations();
  renderAll();
  showToast("Registration cancelled. Seat is available again.");
});

// Download filtered attendee records as CSV.
$("exportBtn").addEventListener("click", () => {
  const eventId = $("attendeeEventFilter").value || "all";
  const search = $("attendeeSearch").value.trim().toLowerCase();

  const rows = registrations.filter(reg => {
    const event = getEvent(reg.eventId);
    const matchesEvent = eventId === "all" || reg.eventId === eventId;

    const matchesSearch = [
      reg.name, reg.studentId, reg.email, event?.name || ""
    ].some(value => value.toLowerCase().includes(search));

    return matchesEvent && matchesSearch;
  });

  if (!rows.length) {
    showToast("No attendee records to export.");
    return;
  }

  function csvCell(value) {
    let text = String(value ?? "");

    // Protect spreadsheet programs from interpreting cells as formulas.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) {
      text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
  }

  const header = [
    "Event", "Student Name", "Student ID", "Email", "Registered On"
  ];

  const csvRows = [
    header,
    ...rows.map(reg => [
      getEvent(reg.eventId)?.name || "Unknown Event",
      reg.name,
      reg.studentId,
      reg.email,
      reg.registeredOn
    ])
  ];

  const csv = "\uFEFF" +
    csvRows.map(row => row.map(csvCell).join(",")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "campus-event-attendees.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("📥 Attendee CSV downloaded!");
});

// First render.
renderAll();
