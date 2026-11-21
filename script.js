// Wedding data comes from config.js. Edit that file to update the public invitation.
        const state = { ...window.WEDDING_CONFIG };
        let wishes = [];
        let countdownTimer = null;

        // Kept as a no-op for compatibility with optional controls in the source template.
        function persistState() {}

        // Image fallback: report the exact missing path and avoid retry loops.
        const IMAGE_FALLBACK = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="#FAF7F2"/><text x="50%" y="48%" text-anchor="middle" fill="#8B3A3A" font-family="Arial" font-size="28">Không tải được ảnh</text><text x="50%" y="56%" text-anchor="middle" fill="#6E635F" font-family="Arial" font-size="16">Kiểm tra tên file trong thư mục assets</text></svg>'
        );

        function setWeddingImage(img, src) {
            if (!img) return;
            img.onerror = function () {
                console.error("[Thiệp cưới] Không tải được ảnh:", this.src,
                    "| Hãy kiểm tra đúng tên file và chữ hoa/chữ thường trong thư mục assets.");
                this.onerror = null;
                this.src = IMAGE_FALLBACK;
            };
            img.src = src;
        }


        // Chỉ lấy dữ liệu từ config khi phần tử HTML chưa có nội dung.
        function setTextIfEmpty(elementId, configValue) {
            const element = document.getElementById(elementId);
            if (!element) return;
            if (!element.textContent.trim() && configValue != null) {
                element.textContent = String(configValue);
            }
        }

        // 2. RENDER ENTIRE WEDDING PAGE
        function renderPage() {
            // Album render trước và độc lập: lỗi ở phần khác không làm mất album.
            try { renderAlbumGrid(); } catch (err) { console.error("[Thiệp cưới] Lỗi render album:", err); }

            // Hero
            setWeddingImage(document.getElementById("hero-bg-img"), state.heroBg);
            document.getElementById("hero-groom-name").textContent = state.groomShort;
            document.getElementById("hero-bride-name").textContent = state.brideShort;
            document.getElementById("hero-lunar-display").textContent = state.lunarDate;

            const parts = state.weddingDate.split("-");
            if (parts.length === 3) {
                document.getElementById("hero-date-display").textContent = `${parts[2]} . ${parts[1]} . ${parts[0]}`;
                document.getElementById("countdown-target-caption").textContent = `Tới ${state.weddingTime} • Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            // Invitation & Portraits
            document.getElementById("invitation-body-text").textContent = state.invitationText;
            document.getElementById("thank-you-body-text").textContent = state.thankYouText;
            setWeddingImage(document.getElementById("groom-portrait-img"), state.groomAvatar);
            setWeddingImage(document.getElementById("bride-portrait-img"), state.brideAvatar);
            document.getElementById("groom-fullname-display").textContent = state.groomFull;
            document.getElementById("bride-fullname-display").textContent = state.brideFull;
            document.getElementById("footer-groom-text").textContent = state.groomShort;
            document.getElementById("footer-bride-text").textContent = state.brideShort;

            // 3 Events
            document.getElementById("ev1-time-display").textContent = state.ev1Time;
            document.getElementById("ev1-date-display").textContent = state.ev1Date;
            setTextIfEmpty("ev1-location-display", state.ev1Location);

            document.getElementById("ev2-time-display").textContent = state.ev2Time;
            document.getElementById("ev2-date-display").textContent = state.ev2Date;
            setTextIfEmpty("ev2-location-display", state.ev2Location);

            document.getElementById("ev3-time-display").textContent = state.ev3Time;
            document.getElementById("ev3-date-display").textContent = state.ev3Date;
            setTextIfEmpty("ev3-location-display", state.ev3Location);

            // Family address text: preserve HTML when present.
            setTextIfEmpty("groom-address-display", state.groomAddress);
            setTextIfEmpty("bride-address-display", state.brideAddress);

            // Map nhà trai follows ev2Location; map nhà gái follows ev3Location.
            const groomMapLocation = state.ev2Location || state.groomAddress;
            const brideMapLocation = state.ev3Location || state.brideAddress;
            document.getElementById("groom-gmap-link").href = `https://maps.google.com/?q=${encodeURIComponent(groomMapLocation)}`;
            document.getElementById("bride-gmap-link").href = `https://maps.google.com/?q=${encodeURIComponent(brideMapLocation)}`;
            selectMapTab("groom");

            // Calendar & Countdown
            renderMonthlyCalendar(state.weddingDate);
            setupCountdown(state.weddingDate, state.weddingTime);

            // 2 QR Codes
            document.getElementById("qr1-title-display").textContent = state.qr1Title;
            document.getElementById("qr1-bank-display").textContent = state.qr1Bank;
            document.getElementById("qr1-holder-display").textContent = state.qr1Holder;
            document.getElementById("qr1-account-display").textContent = state.qr1Account;
            document.getElementById("qr1-image-display").src = state.qr1Img || "https://placehold.co/250x250/FFFFFF/2A2422?text=QR+Chu+Re";

            document.getElementById("qr2-title-display").textContent = state.qr2Title;
            document.getElementById("qr2-bank-display").textContent = state.qr2Bank;
            document.getElementById("qr2-holder-display").textContent = state.qr2Holder;
            document.getElementById("qr2-account-display").textContent = state.qr2Account;
            document.getElementById("qr2-image-display").src = state.qr2Img || "https://placehold.co/250x250/FFFFFF/2A2422?text=QR+Co+Dau";

            // Music label
            document.getElementById("music-track-label").textContent = state.musicTitle;

            // Wishes
            renderWishesList();
        }

        // 3. MONTHLY CALENDAR RENDERER
        function renderMonthlyCalendar(dateStr) {
            const [yStr, mStr, dStr] = dateStr.split("-");
            const year = parseInt(yStr, 10) || 2026;
            const month = parseInt(mStr, 10) || 12;
            const targetDay = parseInt(dStr, 10) || 20;

            document.getElementById("calendar-month-title").textContent = `Tháng ${month} / ${year}`;

            const firstDay = new Date(year, month - 1, 1).getDay();
            // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
            const startOffset = (firstDay + 6) % 7;
            const daysInMonth = new Date(year, month, 0).getDate();

            const grid = document.getElementById("calendar-days-grid");
            grid.innerHTML = "";

            for (let i = 0; i < startOffset; i++) {
                const emptyCell = document.createElement("div");
                emptyCell.className = "py-2.5";
                grid.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement("div");
                if (day === targetDay) {
                    cell.className = "relative py-2.5 rounded-2xl bg-terracotta text-white font-bold shadow-md transform scale-105 flex flex-col items-center justify-center";
                    cell.innerHTML = `<span>${day}</span><span class="text-[9px] leading-none mt-0.5 text-amber-200">♥</span>`;
                } else {
                    cell.className = "py-2.5 rounded-xl text-charcoal/80 hover:bg-champagne/15 transition-colors flex items-center justify-center";
                    cell.textContent = day;
                }
                grid.appendChild(cell);
            }
        }

        // 4. MODERN COUNTDOWN TIMER
        function updateDigitEl(id, val) {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.textContent !== val) {
                el.textContent = val;
                el.classList.remove("animate-digit-tick");
                void el.offsetWidth;
                el.classList.add("animate-digit-tick");
            }
        }

        function setupCountdown(dateStr, timeStr) {
            if (countdownTimer) clearInterval(countdownTimer);

            const [y, m, d] = dateStr.split("-").map(Number);
            const [hh, mm] = (timeStr || "09:00").split(":").map(Number);
            const target = new Date(y, (m || 1) - 1, d || 1, hh || 9, mm || 0, 0);

            function tick() {
                const now = new Date();
                const diff = target.getTime() - now.getTime();

                if (diff <= 0) {
                    updateDigitEl("cd-days", "00");
                    updateDigitEl("cd-hours", "00");
                    updateDigitEl("cd-minutes", "00");
                    updateDigitEl("cd-seconds", "00");
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                updateDigitEl("cd-days", String(days).padStart(2, "0"));
                updateDigitEl("cd-hours", String(hours).padStart(2, "0"));
                updateDigitEl("cd-minutes", String(minutes).padStart(2, "0"));
                updateDigitEl("cd-seconds", String(seconds).padStart(2, "0"));

                document.getElementById("cd-bar-days").style.width = `${Math.min(100, Math.max(10, Math.round(((365 - Math.min(days, 365)) / 365) * 100)))}%`;
                document.getElementById("cd-bar-hours").style.width = `${Math.round(((24 - hours) / 24) * 100)}%`;
                document.getElementById("cd-bar-minutes").style.width = `${Math.round(((60 - minutes) / 60) * 100)}%`;
                document.getElementById("cd-bar-seconds").style.width = `${Math.round(((60 - seconds) / 60) * 100)}%`;
            }

            tick();
            countdownTimer = setInterval(tick, 1000);
        }

        // Download .ICS Calendar File
        function downloadCalendarICS() {
            const cleanDate = state.weddingDate.replace(/-/g, "");
            const cleanTime = (state.weddingTime || "09:00").replace(":", "") + "00";
            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "BEGIN:VEVENT",
                `DTSTART:${cleanDate}T${cleanTime}`,
                `SUMMARY:Lễ Cưới ${state.groomShort} & ${state.brideShort}`,
                `LOCATION:${state.ev1Location}`,
                "DESCRIPTION:Trân trọng kính mời Quý vị đến chung vui lễ thành hôn của chúng tôi!",
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `LeCuoi_${state.groomShort}_${state.brideShort}.ics`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("Đã tải file lịch nhắc nhở (.ICS)!");
        }

        // 5. INTERACTIVE MAP SWITCHER
        function selectMapTab(type) {
            const addressMap = {
                groom: state.ev2Location || state.groomAddress,
                bride: state.ev3Location || state.brideAddress,
                church: state.ev1Location
            };
            const targetAddress = addressMap[type] || state.ev2Location || state.groomAddress;

            ["groom", "bride", "church"].forEach(key => {
                const btn = document.getElementById(`map-btn-${key}`);
                if (!btn) return;
                if (key === type) {
                    btn.className = "px-4 py-2 rounded-full text-xs font-semibold bg-champagne text-white transition-all shadow-xs";
                } else {
                    btn.className = "px-4 py-2 rounded-full text-xs font-semibold bg-cream text-charcoal hover:bg-champagne/20 transition-all";
                }
            });

            document.getElementById("wedding-google-map").src =
                `https://maps.google.com/maps?q=${encodeURIComponent(targetAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            document.getElementById("map-external-direction").href =
                `https://maps.google.com/?q=${encodeURIComponent(targetAddress)}`;
        }

        // 6. PHOTO ALBUM & LIGHTBOX
        // Danh sách ảnh lấy trực tiếp từ config.js (state.album).
        // Khi thêm ảnh: chép file vào assets/ rồi thêm đường dẫn vào mảng album trong config.js.
        // Tự tìm album theo tên assets/1.jpg, assets/2.jpg... để sau này
        // chỉ cần chép ảnh mới vào assets mà không phải sửa config.js.
        async function getAlbumImageList() {
            const configured = Array.isArray(state.album)
                ? state.album.filter(src => typeof src === "string" && src.trim()).map(src => src.trim())
                : [];
            const numbered = [];
            let foundAny = false;
            let missingStreak = 0;

            // Dò số thứ tự liên tục; dừng sau 5 số trống liên tiếp để tránh request vô hạn.
            for (let number = 1; number <= 100; number++) {
                const src = `assets/${number}.jpg`;
                const exists = await new Promise(resolve => {
                    const probe = new Image();
                    probe.onload = () => resolve(true);
                    probe.onerror = () => resolve(false);
                    probe.src = `${src}?album_check=1`;
                });
                if (exists) {
                    numbered.push(src);
                    foundAny = true;
                    missingStreak = 0;
                } else if (foundAny) {
                    missingStreak++;
                    if (missingStreak >= 5) break;
                }
            }

            // Ảnh đặt tên số được ưu tiên; vẫn hỗ trợ đường dẫn tùy chỉnh trong config.
            const combined = [...numbered, ...configured];
            return [...new Set(combined)];
        }

        async function renderAlbumGrid() {
            const grid = document.getElementById("album-grid");
            if (!grid) return;
            grid.replaceChildren();
            grid.innerHTML = '<p class="col-span-full text-sm text-muted text-center py-6">Đang tải album ảnh...</p>';

            const albumImages = await getAlbumImageList();
            grid.replaceChildren();
            if (!albumImages.length) {
                grid.innerHTML = '<p class="col-span-full text-sm text-muted text-center py-6">Chưa tìm thấy ảnh. Hãy đặt ảnh dạng assets/1.jpg, assets/2.jpg... trong thư mục assets.</p>';
                return;
            }

            albumImages.forEach((src, index) => {
                const card = document.createElement("button");
                card.type = "button";
                card.className = "group relative aspect-[4/5] rounded-2xl overflow-hidden bg-ivory border border-champagne/25 shadow-sm focus:outline-none focus:ring-2 focus:ring-champagne";
                card.setAttribute("aria-label", `Mở ảnh cưới ${index + 1}`);
                card.addEventListener("click", () => openLightbox(src));

                const img = document.createElement("img");
                img.src = src;
                img.alt = `Ảnh cưới ${index + 1}`;
                img.loading = "lazy";
                img.decoding = "async";
                img.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500";
                img.addEventListener("error", () => {
                    card.remove();
                    console.error(`[Thiệp cưới] Không tải được ảnh album: ${src}. Kiểm tra đường dẫn và chữ hoa/chữ thường.`);
                }, { once: true });

                const shade = document.createElement("span");
                shade.className = "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none";
                card.append(img, shade);
                grid.appendChild(card);
            });
        }

        function openLightbox(src) {
            const image = document.getElementById("lightbox-img");
            const modal = document.getElementById("lightbox-modal");
            if (!image || !modal) return;

            image.onerror = () => {
                console.error("[Thiệp cưới] Không tải được ảnh phóng to:", src);
                closeLightbox();
            };
            image.src = src;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        }

        function closeLightbox() {
            const modal = document.getElementById("lightbox-modal");
            if (!modal) return;
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }

        // 7. COPY BANK ACCOUNT (IFRAME SAFE)
        function copyBankAccount(elementId) {
            const text = document.getElementById(elementId).textContent.trim();
            const tempInput = document.createElement("textarea");
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand("copy");
                showToast(`Đã sao chép số tài khoản: ${text}`);
            } catch (err) {
                showToast(`Số tài khoản: ${text}`);
            }
            document.body.removeChild(tempInput);
        }

        // 8. GUESTBOOK WISHES (Firestore)
        function escapeHtml(str) {
            const div = document.createElement("div");
            div.textContent = String(str ?? "");
            return div.innerHTML;
        }

        function formatWishTime(value) {
            if (!value) return "Vừa gửi";
            const date = value.toDate ? value.toDate() : new Date(value);
            if (Number.isNaN(date.getTime())) return "Vừa gửi";
            return date.toLocaleString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            });
        }

        function renderWishesList() {
            const container = document.getElementById("wishes-list-container");
            document.getElementById("wishes-count-badge").textContent = `${wishes.length} lời chúc`;

            if (!wishes.length) {
                container.innerHTML = '<p class="text-sm text-muted text-center py-6">Chưa có lời chúc nào. Hãy là người gửi lời chúc đầu tiên nhé!</p>';
                return;
            }

            container.innerHTML = wishes.map(w => `
                <div class="p-4 rounded-2xl bg-cream border border-champagne/20">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span class="font-bold text-sm text-charcoal">${escapeHtml(w.name)}</span>
                        <span class="px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[11px] font-medium">${escapeHtml(w.attend)}</span>
                    </div>
                    <p class="text-sm text-charcoal/85 leading-relaxed whitespace-pre-wrap">${escapeHtml(w.message)}</p>
                    <span class="block text-[11px] text-muted mt-2">${escapeHtml(formatWishTime(w.createdAt))}</span>
                </div>
            `).join("");
        }

        async function startWishesListener() {
            try {
                const firebase = await window.firebaseReady;
                firebase.listenToWishes((newWishes) => {
                    wishes = newWishes;
                    renderWishesList();
                });
            } catch (error) {
                console.error("Không thể tải lời chúc từ Firestore:", error);
                showToast("Chưa tải được lời chúc. Vui lòng tải lại trang.");
            }
        }

        document.getElementById("guestbook-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = this;
            const submitButton = form.querySelector('button[type="submit"]');
            const name = document.getElementById("guest-name-input").value.trim();
            const attend = document.getElementById("guest-attend-input").value;
            const message = document.getElementById("guest-message-input").value.trim();

            if (!name || !message) return;
            if (name.length > 80 || message.length > 1000) {
                showToast("Tên tối đa 80 ký tự, lời chúc tối đa 1000 ký tự.");
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Đang gửi...";
            try {
                const firebase = await window.firebaseReady;
                await firebase.addWish({ name, attend, message });
                form.reset();
                showToast("Cảm ơn bạn đã gửi lời chúc mừng!");
            } catch (error) {
                console.error("Lỗi gửi lời chúc:", error);
                showToast("Gửi lời chúc chưa thành công. Vui lòng thử lại.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Gửi Lời Chúc Ngay";
            }
        });

        window.addEventListener("DOMContentLoaded", startWishesListener);

        // 9. BACKGROUND MUSIC ENGINE (WEB AUDIO API PIANO + CUSTOM FILE/URL)
        let audioCtx = null;
        let pianoTimer = null;
        let noteStep = 0;
        let isMusicPlaying = false;
        const htmlAudio = document.getElementById("custom-audio-player");

        const PIANO_MELODIES = {
            canon: [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 349.23, 392.00],
            serenade: [392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00, 523.25]
        };

        function playSoftPianoNote(freq) {
            try {
                if (!audioCtx) {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    audioCtx = new AudioContextClass();
                }
                if (audioCtx.state === "suspended") {
                    audioCtx.resume();
                }
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.055, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 1.45);
            } catch (err) {}
        }

        function startMusicPlayback() {
            stopMusicPlayback(false);
            isMusicPlaying = true;
            document.getElementById("music-disc-icon").classList.remove("paused-disc");

            if (state.musicMode === "custom" && state.musicSrc) {
                htmlAudio.src = state.musicSrc;
                htmlAudio.play().catch(() => {
                    showToast("Nhấn lại nút nhạc để phát bài hát của bạn");
                });
            } else {
                const seq = PIANO_MELODIES[state.musicPreset] || PIANO_MELODIES.canon;
                playSoftPianoNote(seq[noteStep % seq.length]);
                noteStep++;
                pianoTimer = setInterval(() => {
                    playSoftPianoNote(seq[noteStep % seq.length]);
                    noteStep++;
                }, 950);
            }
        }

        function stopMusicPlayback(updateState = true) {
            if (pianoTimer) {
                clearInterval(pianoTimer);
                pianoTimer = null;
            }
            htmlAudio.pause();
            if (updateState) {
                isMusicPlaying = false;
                document.getElementById("music-disc-icon").classList.add("paused-disc");
            }
        }

        function toggleBackgroundMusic() {
            if (isMusicPlaying) {
                stopMusicPlayback(true);
                showToast("Đã tạm dừng nhạc nền");
            } else {
                startMusicPlayback();
                showToast(`Đang phát: ${state.musicTitle}`);
            }
        }

        // Toast Helper
        let toastTimeout = null;
        function showToast(msg) {
            const box = document.getElementById("toast-box");
            box.textContent = msg;
            box.classList.remove("hidden");
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                box.classList.add("hidden");
            }, 3000);
        }

        // Initialize Page
        window.addEventListener("DOMContentLoaded", renderPage);
