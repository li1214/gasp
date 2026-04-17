function parseBirthday(idCardNo: string): Date | null {
  const id = idCardNo.trim();

  if (/^\d{17}[\dXx]$/.test(id)) {
    const y = Number(id.slice(6, 10));
    const m = Number(id.slice(10, 12));
    const d = Number(id.slice(12, 14));
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
      return dt;
    }
  }

  if (/^\d{15}$/.test(id)) {
    const y = Number(`19${id.slice(6, 8)}`);
    const m = Number(id.slice(8, 10));
    const d = Number(id.slice(10, 12));
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
      return dt;
    }
  }

  return null;
}

export function getAgeFromIdCard(idCardNo: string, today = new Date()) {
  const birthday = parseBirthday(idCardNo);
  if (!birthday) {
    return null;
  }

  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  return age;
}

export function isAdultByIdCard(idCardNo: string, minAge = 18) {
  const age = getAgeFromIdCard(idCardNo);
  if (age === null) {
    return false;
  }
  return age >= minAge;
}