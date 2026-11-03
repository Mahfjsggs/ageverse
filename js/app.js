
"use strict";

/* ==========================================
   AGEVERSE - MAIN APPLICATION
   Version 1.0.0
========================================== */

const $ = (id) => document.getElementById(id);

let birthDateValue = null;
let birthTimeValue = "00:00";
let currentLanguage = "ar";
let liveTimer = null;
let currentAgeData = null;

const LIFE_EXPECTANCY = 80;
const TOTAL_WEEKS = LIFE_EXPECTANCY * 52;

/* ==========================================
   TRANSLATIONS
========================================== */

const translations = {
  ar: {
    invalidDate: "يرجى إدخال تاريخ ميلاد صحيح",
    futureDate: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
    calculate: "احسب عمري",
    years: "سنة",
    months: "شهر",
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",
    livedDays: "الأيام التي عشتها",
    livedHours: "الساعات",
    livedMinutes: "الدقائق",
    livedSeconds: "الثواني",
    nextBirthday: "عيد ميلادك القادم",
    remaining: "المتبقي",
    today: "اليوم عيد ميلادك! 🎂",
    birthdayTomorrow: "غداً عيد ميلادك 🎉",
    daysLeft: "يوم متبقي",
    lifeTitle: "خريطة حياتك",
    lifeDescription: "كل مربع يمثل أسبوعاً من حياتك",
    weeks: "أسبوع",
    lived: "عشته",
    remainingWeeks: "متبقي",
    futureError: "أدخل سنة مستقبلية صحيحة",
    futureAge: "سيصبح عمرك",
    futureYears: "سنة",
    copied: "تم نسخ النتيجة بنجاح",
    shareError: "تعذرت المشاركة، حاول النسخ",
    shareText: "عمري في AGEVERSE",
    lifeNote: "هذه الخريطة تقديرية بناءً على عمر افتراضي قدره 80 سنة",
    ageResult: "عمرك الحالي",
    born: "تاريخ الميلاد",
    featureOne: "حاسبة العمر",
    featureTwo: "عيد الميلاد",
    featureThree: "خريطة الحياة",
    featureFour: "المستقبل",
    emptyTitle: "اكتشف عمرك الحقيقي",
    emptyDescription: "أدخل تاريخ ميلادك لتكتشف تفاصيل رحلتك الزمنية",
    futureHint: "اكتب أي سنة مستقبلية لمعرفة عمرك فيها",
    language: "EN",
    footer: "رحلتك عبر الزمن تبدأ هنا"
  },

  en: {
    invalidDate: "Please enter a valid birth date",
    futureDate: "Birth date cannot be in the future",
    calculate: "Calculate My Age",
    years: "Years",
    months: "Months",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    livedDays: "Days lived",
    livedHours: "Hours",
    livedMinutes: "Minutes",
    livedSeconds: "Seconds",
    nextBirthday: "Your next birthday",
    remaining: "Remaining",
    today: "Today is your birthday! 🎂",
    birthdayTomorrow: "Your birthday is tomorrow 🎉",
    daysLeft: "days left",
    lifeTitle: "Your Life Map",
    lifeDescription: "Each square represents one week of your life",
    weeks: "Weeks",
    lived: "Lived",
    remainingWeeks: "Remaining",
    futureError: "Enter a valid future year",
    futureAge: "You will be",
    futureYears: "years old",
    copied: "Result copied successfully",
    shareError: "Unable to share. Try copying instead",
    shareText: "My age on AGEVERSE",
    lifeNote: "This map is an estimate based on an 80-year lifespan",
    ageResult: "Your current age",
    born: "Date of birth",
    featureOne: "Age Calculator",
    featureTwo: "Birthday",
    featureThree: "Life Map",
    featureFour: "Future",
    emptyTitle: "Discover your true age",
    emptyDescription: "Enter your birthday to discover your journey through time",
    futureHint: "Enter any future year to discover your age",
    language: "عربي",
    footer: "Your journey through time starts here"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

/* ==========================================
   LANGUAGE SYSTEM
========================================== */

function changeLanguage() {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar";

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir =
    currentLanguage === "ar" ? "rtl" : "ltr";

  document.body.dir =
    currentLanguage === "ar" ? "rtl" : "ltr";

  const toggle = $("languageToggle");

  if (toggle) {
    toggle.textContent = t("language");
  }

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;

    if (translations[currentLanguage][key]) {
      element.textContent = t(key);
    }
  });

  if (currentAgeData) {
    displayAge(currentAgeData);
  }

  updateLifeMap();

  if ($("futureResult") && !$("futureResult").classList.contains("hidden")) {
    calculateFutureAge();
  }
}

/* ==========================================
   DATE HELPERS
========================================== */

function parseLocalDate(dateString, timeString = "00:00") {
  if (!dateString) return null;

  const parts = dateString.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  const [hour, minute] = timeString.split(":").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    hour || 0,
    minute || 0,
    0
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getAgeParts(birth, now) {
  let years = now.getFullYear() - birth.getFullYear();

  let birthdayThisYear = new Date(
    now.getFullYear(),
    birth.getMonth(),
    birth.getDate(),
    birth.getHours(),
    birth.getMinutes()
  );

  if (birthdayThisYear > now) {
    years--;
  }

  let months = now.getMonth() - birth.getMonth();

  if (
    now.getDate() < birth.getDate() ||
    (
      now.getDate() === birth.getDate() &&
      (
        now.getHours() < birth.getHours() ||
        (
          now.getHours() === birth.getHours() &&
          now.getMinutes() < birth.getMinutes()
        )
      )
    )
  ) {
    months--;
  }

  if (months < 0) months += 12;

  const lastBirthday = new Date(
    birth.getFullYear() + years,
    birth.getMonth(),
    birth.getDate(),
    birth.getHours(),
    birth.getMinutes()
  );

  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    birth.getDate(),
    birth.getHours(),
    birth.getMinutes()
  );

  let days = Math.floor(
    (now - lastMonth) / 86400000
  );

  if (days < 0) {
    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days)
  };
}

function getNextBirthday(birth, now) {
  let year = now.getFullYear();

  let next = new Date(
    year,
    birth.getMonth(),
    birth.getDate(),
    birth.getHours(),
    birth.getMinutes()
  );

  if (next <= now) {
    next = new Date(
      year + 1,
      birth.getMonth(),
      birth.getDate(),
      birth.getHours(),
      birth.getMinutes()
    );
  }

  return next;
}

/* ==========================================
   CALCULATE AGE
========================================== */

function calculateAge() {
  const dateInput = $("birthDate");

  if (!dateInput || !dateInput.value) {
    showError(t("invalidDate"));
    return;
  }

  birthDateValue = parseLocalDate(
    dateInput.value,
    $("birthTime")?.value || "00:00"
  );

  if (!birthDateValue) {
    showError(t("invalidDate"));
    return;
  }

  if (birthDateValue > new Date()) {
    showError(t("futureDate"));
    return;
  }

  birthTimeValue = $("birthTime")?.value || "00:00";

  clearInterval(liveTimer);

  const error = $("formError");

  if (error) error.textContent = "";

  const panel = $("resultPanel");
  const content = $("resultContent");

  panel?.classList.remove("hidden");
  content?.classList.remove("hidden");

  $("resultPanel")?.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

  updateAge();

  liveTimer = setInterval(updateAge, 1000);
}

/* ==========================================
   LIVE AGE UPDATE
========================================== */

function updateAge() {
  if (!birthDateValue) return;

  const now = new Date();
  const difference = now - birthDateValue;

  if (difference < 0) return;

  const age = getAgeParts(birthDateValue, now);

  const totalSeconds = Math.floor(difference / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const data = {
    age,
    totalSeconds,
    totalMinutes,
    totalHours,
    totalDays,
    birth: birthDateValue,
    now
  };

  currentAgeData = data;

  displayAge(data);
  updateLifeMap();
}

/* ==========================================
   DISPLAY AGE
========================================== */

function displayAge(data) {
  const { age, totalSeconds, totalMinutes, totalHours, totalDays } = data;

  const ageMain = $("ageMain");

  if (ageMain) {
    ageMain.textContent =
      `${age.years} ${t("years")}`;
  }

  if ($("ageCaption")) {
    $("ageCaption").textContent =
      `${age.months} ${t("months")} · ${age.days} ${t("days")}`;
  }

  if ($("daysLived")) {
    $("daysLived").textContent =
      totalDays.toLocaleString();
  }

  if ($("hoursLived")) {
    $("hoursLived").textContent =
      totalHours.toLocaleString();
  }

  if ($("minutesLived")) {
    $("minutesLived").textContent =
      totalMinutes.toLocaleString();
  }

  if ($("secondsLived")) {
    $("secondsLived").textContent =
      totalSeconds.toLocaleString();
  }

  calculateBirthday(data.birth, data.now);

  if ($("previewAge")) {
    $("previewAge").textContent =
      `${age.years}`;
  }

  if ($("previewDate")) {
    $("previewDate").textContent =
      data.birth.toLocaleDateString(
        currentLanguage === "ar" ? "ar-IQ" : "en-US"
      );
  }
}

/* ==========================================
   BIRTHDAY COUNTDOWN
========================================== */

function calculateBirthday(birth, now) {
  const next = getNextBirthday(birth, now);

  const remaining = next - now;

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);

  const output = $("birthdayCountdown");

  if (!output) return;

  if (days === 0 && hours === 0) {
    output.textContent = t("today");
  } else if (days === 0) {
    output.textContent =
      `${t("remaining")} ${hours} ${t("hours")}`;
  } else {
    output.textContent =
      `${days} ${t("daysLeft")} · ${hours} ${t("hours")}`;
  }
}

/* ==========================================
   LIFE MAP - 80 YEARS
========================================== */

function updateLifeMap() {
  const map = $("lifeMap");
  const empty = $("lifeMapEmpty");

  if (!map || !birthDateValue) return;

  const now = new Date();

  const weeksLived = Math.max(
    0,
    Math.floor((now - birthDateValue) / (7 * 86400000))
  );

  const limitedWeeks = Math.min(
    weeksLived,
    TOTAL_WEEKS
  );

  if (map.dataset.rendered !== "true") {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < TOTAL_WEEKS; i++) {
      const dot = document.createElement("span");

      dot.className = "life-dot";
      dot.title = `${t("weeks")} ${i + 1}`;

      fragment.appendChild(dot);
    }

    map.appendChild(fragment);
    map.dataset.rendered = "true";
  }

  const dots = map.children;

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle(
      "lived",
      i < limitedWeeks
    );

    dots[i].classList.toggle(
      "current",
      i === limitedWeeks && limitedWeeks < TOTAL_WEEKS
    );
  }

  map.classList.remove("hidden");

  if (empty) {
    empty.classList.add("hidden");
  }

  if ($("weeksCount")) {
    $("weeksCount").textContent =
      limitedWeeks.toLocaleString();
  }
}

/* ==========================================
   FUTURE AGE CALCULATOR
========================================== */

function calculateFutureAge() {
  const input = $("futureYear");
  const output = $("futureResult");

  if (!input || !output || !birthDateValue) {
    return;
  }

  const year = Number(input.value);

  const currentYear = new Date().getFullYear();

  if (
    !Number.isInteger(year) ||
    year <= currentYear ||
    year > currentYear + 500
  ) {
    output.textContent = t("futureError");
    output.classList.remove("hidden");
    return;
  }

  const age = year - birthDateValue.getFullYear();

  output.textContent =
    `${t("futureAge")} ${age} ${t("futureYears")} ✨`;

  output.classList.remove("hidden");
}

/* ==========================================
   SHARE AGE
========================================== */

async function shareAge() {
  if (!currentAgeData) {
    showToast(t("invalidDate"));
    return;
  }

  const age = currentAgeData.age;

  const text =
    `${t("shareText")} AGEVERSE\n` +
    `${age.years} ${t("years")} ` +
    `${age.months} ${t("months")} ` +
    `${age.days} ${t("days")}\n` +
    `ageverse`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "AGEVERSE",
        text
      });
    } else {
      await navigator.clipboard.writeText(text);
      showToast(t("copied"));
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      try {
        await navigator.clipboard.writeText(text);
        showToast(t("copied"));
      } catch {
        showToast(t("shareError"));
      }
    }
  }
}

/* ==========================================
   TOAST
========================================== */

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function showError(message) {
  const error = $("formError");

  if (error) {
    error.textContent = message;
  }
}

/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* Language */

  $("languageToggle")?.addEventListener(
    "click",
    changeLanguage
  );

  /* Calculate */

  $("calculateBtn")?.addEventListener(
    "click",
    calculateAge
  );

  /* Enter key */

  $("birthDate")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      calculateAge();
    }
  });

  $("birthTime")?.addEventListener("change", () => {
    if (birthDateValue) {
      calculateAge();
    }
  });

  /* Future age */

  $("futureBtn")?.addEventListener(
    "click",
    calculateFutureAge
  );

  $("futureYear")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      calculateFutureAge();
    }
  });

  /* Share */

  $("shareBtn")?.addEventListener(
    "click",
    shareAge
  );

  /* Current year */

  if ($("yearNow")) {
    $("yearNow").textContent =
      new Date().getFullYear();
  }

  /* Initial direction */

  document.documentElement.lang = "ar";
  document.documentElement.dir = "rtl";
  document.body.dir = "rtl";

  console.log(
    "%c AGEVERSE ",
    "background:#8653db;color:white;font-size:20px;font-weight:bold;padding:8px;"
  );

  console.log("AGEVERSE initialized successfully");
});
