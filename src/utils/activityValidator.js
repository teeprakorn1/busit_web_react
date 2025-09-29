// utils/activityValidator.js

export const validateActivityForm = (formData) => {
  const errors = {};

  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'กรุณากรอกชื่อกิจกรรม';
  } else if (formData.title.length < 3) {
    errors.title = 'ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร';
  } else if (formData.title.length > 255) {
    errors.title = 'ชื่อกิจกรรมต้องไม่เกิน 255 ตัวอักษร';
  }

  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'กรุณากรอกรายละเอียดกิจกรรม';
  } else if (formData.description.length < 10) {
    errors.description = 'รายละเอียดกิจกรรมต้องมีอย่างน้อย 10 ตัวอักษร';
  } else if (formData.description.length > 1023) {
    errors.description = 'รายละเอียดกิจกรรมต้องไม่เกิน 1023 ตัวอักษร';
  }

  if (!formData.startTime || formData.startTime === '') {
    errors.startTime = 'กรุณาเลือกเวลาเริ่มต้นกิจกรรม';
  } else {
    const startTime = new Date(formData.startTime);
    const now = new Date();

    if (isNaN(startTime.getTime())) {
      errors.startTime = 'รูปแบบเวลาเริ่มต้นไม่ถูกต้อง';
    } else if (startTime < now) {
      errors.startTime = 'เวลาเริ่มต้นต้องเป็นอนาคต';
    }
  }

  if (!formData.endTime || formData.endTime === '') {
    errors.endTime = 'กรุณาเลือกเวลาสิ้นสุดกิจกรรม';
  } else {
    const endTime = new Date(formData.endTime);

    if (isNaN(endTime.getTime())) {
      errors.endTime = 'รูปแบบเวลาสิ้นสุดไม่ถูกต้อง';
    } else if (formData.startTime) {
      const startTime = new Date(formData.startTime);

      if (endTime <= startTime) {
        errors.endTime = 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น';
      }

      const durationInDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
      if (durationInDays > 30) {
        errors.endTime = 'ระยะเวลากิจกรรมต้องไม่เกิน 30 วัน';
      }
    }
  }

  if (formData.locationDetail && formData.locationDetail.length > 255) {
    errors.locationDetail = 'รายละเอียดสถานที่ต้องไม่เกิน 255 ตัวอักษร';
  }

  if (formData.imageFile) {
    const file = formData.imageFile;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      errors.imageFile = 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB';
    }

    if (!allowedTypes.includes(file.type)) {
      errors.imageFile = 'ไฟล์รูปภาพต้องเป็น JPG หรือ PNG เท่านั้น';
    }
  }

  return errors;
};

export const isValidDateRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      message: 'รูปแบบวันที่ไม่ถูกต้อง'
    };
  }

  if (start < now) {
    return {
      valid: false,
      message: 'เวลาเริ่มต้นต้องเป็นอนาคต'
    };
  }

  if (end <= start) {
    return {
      valid: false,
      message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น'
    };
  }

  return {
    valid: true,
    message: 'วันที่และเวลาถูกต้อง'
  };
};

export const formatActivityDate = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'วันที่ไม่ถูกต้อง';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('th-TH', options);
};

export const calculateActivityDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'ไม่สามารถคำนวณได้';
  }

  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} วัน ${remainingHours} ชั่วโมง`;
  }

  if (hours > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`;
  }

  return `${minutes} นาที`;
};