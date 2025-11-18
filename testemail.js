let bookingData = {
  movie: "", branch: "", date: "", time: "",
  seats: [], quantity: 1, total: 0,
  customerName: "", customerEmail: "", customerPhone: ""
};

function showScreen(num) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen' + num).classList.add('active');
  document.querySelectorAll('.progress-step').forEach((step, i) => {
    step.classList.toggle('active', i === num - 2);
  });
  if (num === 3) {
    renderSeats();
    updateSummary();
  }
  if (num === 4) populatePaymentPage();
}

function renderSeats() {
  const grid = document.getElementById("seatGrid");
  const numbers = document.getElementById("seatNumbers");
  if (!grid || !numbers) return;

  grid.innerHTML = "";
  numbers.innerHTML = '<div style="width:40px"></div>'; // Spacer for row labels

  // Generate seat numbers 1-30
  for (let i = 1; i <= 30; i++) {
    const num = document.createElement('div');
    num.className = 'num';
    num.textContent = i;
    numbers.appendChild(num);
  }

  // Generate rows A-L
  "ABCDEFGHIJKL".split("").forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'seat-row';

    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = row;
    rowDiv.appendChild(label);

    const seatsDiv = document.createElement('div');
    seatsDiv.className = 'row-seats';

    for (let i = 1; i <= 30; i++) {
      const seat = document.createElement('div');
      seat.className = 'seat available';
      seat.dataset.seat = row + i;
      seat.title = row + i;

      // Randomly book 25% of seats
      if (Math.random() < 0.25) {
        seat.classList.replace('available', 'booked');
      }

      seat.onclick = () => {
        if (seat.classList.contains('booked')) return;

        const id = seat.dataset.seat;
        if (seat.classList.contains('selected')) {
          seat.classList.remove('selected');
          bookingData.seats = bookingData.seats.filter(s => s !== id);
        } else if (bookingData.seats.length < bookingData.quantity) {
          seat.classList.add('selected');
          bookingData.seats.push(id);
        }
        updateSummary();
      };

      seatsDiv.appendChild(seat);
    }
    rowDiv.appendChild(seatsDiv);
    grid.appendChild(rowDiv);
  });
}

function updateSummary() {
  const total = 200 * bookingData.seats.length;
  document.getElementById("sumMovie").textContent = bookingData.movie || "-";
  document.getElementById("sumTheater").textContent = bookingData.branch || "-";
  document.getElementById("sumDate").textContent = bookingData.date || "-";
  document.getElementById("sumTime").textContent = bookingData.time || "-";
  document.getElementById("sumSeats").textContent = bookingData.seats.length ? bookingData.seats.sort().join(", ") : "None";
  document.getElementById("sumTotal").textContent = `₱${total.toLocaleString()}`;
  document.getElementById("qtyInput").value = bookingData.quantity;
  document.getElementById("confirmSeatsBtn").disabled = bookingData.seats.length === 0;
}

function populatePaymentPage() {
  bookingData.total = 200 * bookingData.seats.length;
  document.getElementById("payMovie").textContent = bookingData.movie;
  document.getElementById("payTheater").textContent = bookingData.branch;
  document.getElementById("payDateTime").textContent = `${bookingData.date} • ${bookingData.time}`;
  document.getElementById("paySeats").textContent = bookingData.seats.sort().join(", ");
  document.getElementById("payTotal").textContent = `₱${bookingData.total.toLocaleString()}`;
  document.getElementById("displayName").textContent = bookingData.customerName;
  document.getElementById("displayEmail").textContent = bookingData.customerEmail;
  document.getElementById("displayPhone").textContent = bookingData.customerPhone;
}

document.addEventListener("DOMContentLoaded", () => {
  emailjs.init("bKaZQX-XPBw9O6dVD"); // ← Replace

  // Movie selection
  document.querySelectorAll("[data-movie]").forEach(btn => {
    btn.onclick = () => {
      bookingData.movie = btn.dataset.movie;
      document.getElementById("detailTitle").textContent = bookingData.movie;
      showScreen(2);
    };
  });

  // Screen 2 validation
  const branchSelect = document.getElementById("branch");
  const dateSelect = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const bookNowBtn = document.getElementById("bookNowBtn");

  const validateScreen2 = () => {
    const ok = branchSelect.value && dateSelect.value && timeSelect.value;
    bookNowBtn.disabled = !ok;
    if (ok) {
      bookingData.branch = branchSelect.value;
      bookingData.date = dateSelect.value;
      bookingData.time = timeSelect.value;
    }
  };
  branchSelect.onchange = validateScreen2;
  dateSelect.onchange = validateScreen2;
  timeSelect.onchange = validateScreen2;
  bookNowBtn.onclick = () => showScreen(3);

  // Quantity controls
  document.getElementById("qtyMinus").onclick = () => {
    if (bookingData.quantity <= 1) return;
    bookingData.quantity--;
    if (bookingData.seats.length > bookingData.quantity) {
      const excess = bookingData.seats.splice(bookingData.quantity);
      excess.forEach(id => {
        const el = document.querySelector(`[data-seat="${id}"]`);
        if (el) el.classList.remove('selected');
      });
    }
    updateSummary();
  };

  document.getElementById("qtyPlus").onclick = () => {
    bookingData.quantity++;
    updateSummary();
  };

  // Confirm Seats → Open Modal
  document.getElementById("confirmSeatsBtn").onclick = () => {
    if (bookingData.seats.length === 0) return alert("Please select at least one seat!");
    document.getElementById("customerModal").classList.add("active");
  };

  // Modal → Continue
  document.getElementById("continueToPayment").onclick = () => {
    const name = document.getElementById("custName").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const phone = document.getElementById("custPhone").value.trim();

    if (!name || !email || !phone) return alert("Please fill all fields");
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Invalid email");
    if (!/^09\d{9}$/.test(phone)) return alert("Phone must be 11 digits starting with 09");

    bookingData.customerName = name;
    bookingData.customerEmail = email;
    bookingData.customerPhone = phone;

    document.getElementById("customerModal").classList.remove("active");
    showScreen(4);
  };

  document.querySelector(".modal-close").onclick = () => {
    document.getElementById("customerModal").classList.remove("active");
  };

  // Payment tabs
  document.querySelectorAll(".method-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".method-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("cardForm").classList.toggle("active", tab.dataset.method === "card");
      document.getElementById("gcashForm").classList.toggle("active", tab.dataset.method === "gcash");
    };
  });

  // Pay Now
  document.getElementById("payNowBtn").onclick = () => {
    const btn = document.getElementById("payNowBtn");
    btn.textContent = "Processing..."; btn.disabled = true;

    const orderID = "ORD-" + Date.now().toString(36).toUpperCase().slice(-8);
    bookingData.total = 200 * bookingData.seats.length;

    emailjs.send("service_fnsvz3o", "template_r7o56ne", {
      to_name: bookingData.customerName,
      to_email: bookingData.customerEmail,
      order_id: orderID,
      movie: bookingData.movie,
      theater: bookingData.branch,
      date: bookingData.date,
      time: bookingData.time,
      seats: bookingData.seats.join(", "),
      qty: bookingData.seats.length,
      total: `₱${bookingData.total.toLocaleString()}`
    })
    .then(() => showSuccessPage(orderID))
    .catch(() => showSuccessPage(orderID))
    .finally(() => {
      btn.textContent = "Pay Now & Confirm Booking";
      btn.disabled = false;
    });
  };

  function showSuccessPage(orderID) {
    document.getElementById("successOrderID").textContent = orderID;
    document.getElementById("successName").textContent = bookingData.customerName;
    document.getElementById("successEmail").textContent = bookingData.customerEmail;
    document.getElementById("successEmailNote").textContent = bookingData.customerEmail;
    document.getElementById("successMovie").textContent = bookingData.movie;
    document.getElementById("successTheater").textContent = bookingData.branch;
    document.getElementById("successDateTime").textContent = `${bookingData.date} • ${bookingData.time}`;
    document.getElementById("successSeats").textContent = bookingData.seats.sort().join(", ");
    document.getElementById("successTotal").textContent = `₱${bookingData.total.toLocaleString()}`;
    showScreen(5);
  }
});