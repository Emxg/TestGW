// ตัวกรอง
const colorFilterDropdown = document.querySelector('.color-filter-dropdown');
const imgItem = document.querySelectorAll('.gallery img');

colorFilterDropdown.addEventListener('change', function () {
    const selectedColor = this.value;

    imgItem.forEach(img => {
        if (selectedColor === 'all' || img.getAttribute('data-filter') === selectedColor) {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    });
});

// เรียงลำดับ
const sortDropdown = document.querySelector('.sort-dropdown');
const gallery = document.querySelector('.gallery');

sortDropdown.addEventListener('change', function () {
    const selectedOption = this.value;
    const images = Array.from(gallery.querySelectorAll('img'));

    if (selectedOption === 'newest') {
        images.sort((a, b) => {
            const aIndex = parseInt(a.getAttribute('alt'));
            const bIndex = parseInt(b.getAttribute('alt'));
            return bIndex - aIndex;
        });
    } else if (selectedOption === 'oldest') {
        images.sort((a, b) => {
            const aIndex = parseInt(a.getAttribute('alt'));
            const bIndex = parseInt(b.getAttribute('alt'));
            return aIndex - bIndex;
        });
    }

    images.forEach(image => {
        gallery.appendChild(image);
    });
});

// เพิ่ม data ตัวที่อื่นได้ไม่จำกัด
colorFilterDropdown.addEventListener('change', function () {
    const selectedColor = this.value;

    imgItem.forEach(img => {
        const filters = img.dataset.filter.split(' ');

        if (selectedColor === 'all' || filters.includes(selectedColor)) {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    });
});

// คลิกและเลื่อนรูป
const images = document.querySelectorAll('.gallery img');
const modal = document.querySelector('.modal');
let currentImageIndex = -1;

const openModal = (index) => {
    modal.innerHTML = `<img src="${images[index].src}" alt="Large Image">`;
    modal.style.display = 'block';
    currentImageIndex = index;
    currentScale = 1.0;
    modal.style.transform = `scale(${currentScale})`;
};

const openNextImage = () => {
    if (currentImageIndex !== -1) {
        if (sortDropdown.value === 'newest') {
            let nextIndex = (currentImageIndex + 1) % images.length;
            while (images[nextIndex].style.display === 'none') {
                nextIndex = (nextIndex + 1) % images.length;
            }
            currentImageIndex = nextIndex;
        } else {
            let nextIndex = (currentImageIndex - 1 + images.length) % images.length;
            while (images[nextIndex].style.display === 'none') {
                nextIndex = (nextIndex - 1 + images.length) % images.length;
            }
            currentImageIndex = nextIndex;
        }

        openModal(currentImageIndex);
    }
};

const openPreviousImage = () => {
    if (currentImageIndex !== -1) {
        if (sortDropdown.value === 'newest') {
            let prevIndex = (currentImageIndex - 1 + images.length) % images.length;
            while (images[prevIndex].style.display === 'none') {
                prevIndex = (prevIndex - 1 + images.length) % images.length;
            }
            currentImageIndex = prevIndex;
        } else {
            let prevIndex = (currentImageIndex + 1) % images.length;
            while (images[prevIndex].style.display === 'none') {
                prevIndex = (prevIndex + 1) % images.length;
            }
            currentImageIndex = prevIndex;
        }

        openModal(currentImageIndex);
    }
};

// ซูม
let currentScale = 1.0;
const scaleStep = 0.15;

modal.addEventListener('wheel', (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
        currentScale += scaleStep;
    } else if (event.deltaY > 0 && currentScale > 1.0) {
        currentScale -= scaleStep;
    }

    currentScale = Math.max(1.0, Math.min(2.5, currentScale));
    modal.style.transform = `scale(${currentScale})`;
});

// ตรวจสอบปุ่ม Esc และการเปิด modal
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        modal.style.display = 'none';
        mc.set({ enable: true });
    } else if (modal.style.display === 'block') {
        if (event.key === 'ArrowLeft') {
            openPreviousImage();
        } else if (event.key === 'ArrowRight') {
            openNextImage();
        }
        mc.set({ enable: false });
    }
});

images.forEach((img, index) => {
    img.addEventListener('click', () => {
        openModal(index);
    });
});

modal.addEventListener('click', (event) => {
    // เพิ่มการตรวจสอบว่าคลิกไปที่โมเดลหรือไม่
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

const mc = new Hammer(modal);
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
mc.on('swipeleft', openNextImage);
mc.on('swiperight', openPreviousImage);

// ประกาศตัวแปรสำหรับการซูมด้วยนิ้ว
let isPinchZooming = false;
let initialPinchDistance = 0;

// ตรวจสอบเมื่อสัมผัสนิ้วที่ใช้สำหรับการซูมด้วยนิ้ว
modal.addEventListener('touchstart', (event) => {
if (event.touches.length === 2) {
isPinchZooming = true;
initialPinchDistance = Math.hypot(
    event.touches[0].clientX - event.touches[1].clientX,
    event.touches[0].clientY - event.touches[1].clientY
);
}
});

// ตรวจสอบเมื่อยกเลิกการสัมผัสนิ้วสำหรับการซูมด้วยนิ้ว
modal.addEventListener('touchend', () => {
isPinchZooming = false;
});

// ปรับขนาดโมเดลในฟังก์ชัน touchmove
modal.addEventListener('touchmove', (event) => {
if (isPinchZooming && event.touches.length === 2) {
const touch1 = event.touches[0];
const touch2 = event.touches[1];
const currentPinchDistance = Math.hypot(
    touch1.clientX - touch2.clientX,
    touch1.clientY - touch2.clientY
);

// คำนวณการเพิ่มหรือลดขนาดของโมเดล
const pinchDelta = currentPinchDistance - initialPinchDistance;
if (pinchDelta > 0) {
    currentScale += scaleStep;
} else if (pinchDelta < 0 && currentScale > 1.0) {
    currentScale -= scaleStep;
}

// กำหนดขอบเขตสูงสุดและต่ำสุดของขนาดโมเดล
currentScale = Math.max(1.0, Math.min(2.5, currentScale));
modal.style.transform = `scale(${currentScale})`;

initialPinchDistance = currentPinchDistance;
}
});

/* การคลิกสองครั้งเพื่อซูมเข้าและออก */
// ตรวจสอบการดับเบิลคลิกบนภาพเพื่อย้อนกลับไปหน้าเดิม
modal.addEventListener('dblclick', () => {
// เช็คว่าโมเดลอยู่ในโหมดซูมหรือไม่
if (currentScale !== 1.0) {
// กลับไปยังขนาดปกติ (1.0)
currentScale = 1.0;
modal.style.transform = `scale(${currentScale})`;
} else {
// ซูมเข้าเมื่ออยู่ในโหมดปกติ
currentScale = 1.5; // 2.0 คือขนาดซูมเข้าที่คุณต้องการ
modal.style.transform = `scale(${currentScale})`;
}
});
let lastTouchTime = 0;
modal.addEventListener('touchstart', (e) => {
const currentTime = new Date().getTime();
const timeSinceLastTouch = currentTime - lastTouchTime;

if (timeSinceLastTouch < 300) {
// เช็คว่าโมเดลอยู่ในโหมดซูมหรือไม่
if (currentScale !== 1.0) {
    // กลับไปยังขนาดปกติ (1.0)
    currentScale = 1.0;
    modal.style.transform = `scale(${currentScale})`;
} else {
    // ซูมเข้าเมื่ออยู่ในโหมดปกติ
currentScale = 1.5; // 2.0 คือขนาดซูมเข้าที่คุณต้องการ
modal.style.transform = `scale(${currentScale})`;
}
}

lastTouchTime = currentTime;
});

modal.addEventListener('touchend', () => {
// ไม่ต้องกระทำอะไรเมื่อปล่อยนิ้ว
});
/* จบการคลิกสองครั้งเพื่อซูมเข้าและออก */
// ปุ่ม Back to Top
const toTop = document.querySelector(".to-top");

window.addEventListener("scroll", () => {
if (window.pageYOffset > 100) {
toTop.classList.add("active");
} else {
toTop.classList.remove("active");
}
});

// เพิ่ม event listener สำหรับคลิกปุ่ม "Back to Top"
toTop.addEventListener("click", () => {
event.preventDefault(); // ปิดการเปิดลิงก์
// ขยับไปที่ด้านบนของหน้าเว็บด้วยการใช้ smooth scroll
window.scrollTo({
top: 0,
behavior: "smooth"
});
});