// ==UserScript==
// @name         🚀 SIÊU TOOL v9.1 - CHUẨN HÓA
// @namespace    http://tampermonkey.net/
// @version      9.1
// @description  Máy trạng thái hoàn chỉnh + Bo Góc + Khắc phục mọi lỗi Logic
// @match        *://bi.thegioididong.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // =========================================================================
    // PHÒNG 0: BỘ CÔNG CỤ LÕI & LUẬT LÀM TRÒN
    // =========================================================================
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const STICKERS = ["📱","📲","💻","🖥️","🖱️","⌨️","🎧","🔋","⌚","📷","💵","💰","💸","🏦","💳","📝","🛡️","🌐","📶","🚩","📊","📉","📢", "🔥", "📦"];

    const lamTronTamHoa = (num) => {
        let n = parseFloat(num);
        if (isNaN(n)) return 0;
        if (n < 1.5 && n > 0) return 1;
        return Math.round(n);
    };

    function waitForElement(selector, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) { observer.disconnect(); resolve(el); }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { observer.disconnect(); reject(new Error(`Quá thời gian chờ: ${selector}`)); }, timeout);
        });
    }

    let rocketInterval = null;

    function hienThiVuTruLoading() {
        if (!document.getElementById('rocket-style-permanent')) {
            const css = `
                .skst-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: #050505; z-index: 2147483647 !important; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; overflow: hidden; pointer-events: all; }
                .stars-bg { position: absolute; top:0; left:0; width:100%; height:100%; z-index: 0; }
                .star-bg-point { position: absolute; background: #fff; border-radius: 50%; box-shadow: 0 0 8px #fff; animation: blink 2.5s infinite; }
                @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
                .rocket-container { position: relative; font-size: 80px; z-index: 1; animation: launch 2s infinite ease-in-out; }
                @keyframes launch { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
                .star-sparkle { position: absolute; width: 12px; height: 12px; background: #fff; border-radius: 50%; box-shadow: 0 0 20px #fff, 0 0 30px #00d2ff; animation: pulse 1.5s infinite alternate; }
                @keyframes pulse { 0% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.8); } }
                .status-text { margin-top: 80px; font-family: sans-serif; font-size: 22px; letter-spacing: 4px; color: #fff; text-transform: uppercase; font-weight: 900; z-index: 1; text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #00d2ff; }
            `;
            let style = document.createElement('style'); style.id = 'rocket-style-permanent'; style.innerHTML = css; document.head.appendChild(style);
        }

        if (rocketInterval) return;

        rocketInterval = setInterval(() => {
            if (!document.getElementById('master-loading-overlay')) {
                let div = document.createElement('div');
                div.id = 'master-loading-overlay'; div.className = 'skst-overlay';

                let bgStars = '<div class="stars-bg">';
                for(let i=0; i<60; i++) {
                    let size = Math.random() * 3 + 2;
                    bgStars += `<div class="star-bg-point" style="width:${size}px; height:${size}px; left:${Math.random()*100}%; top:${Math.random()*100}%; animation-delay:${Math.random()*2.5}s;"></div>`;
                }
                bgStars += '</div>';

                div.innerHTML = bgStars + `
                    <div class="rocket-container" id="rocket">🌟<div id="stars"></div></div>
                    <div class="status-text">LOADING...</div>
                `;
                document.body.appendChild(div);

                const starContainer = document.getElementById('stars');
                for(let i=0; i<12; i++) {
                    let star = document.createElement('div'); star.className = 'star-sparkle';
                    let angle = (i / 12) * Math.PI * 2;
                    star.style.left = (40 + Math.cos(angle) * 80) + "px"; star.style.top = (40 + Math.sin(angle) * 80) + "px";
                    star.style.animationDelay = (i * 0.15) + "s";
                    starContainer.appendChild(star);
                }
            }
        }, 100);
    }

    function tatVuTruLoading() {
        if (rocketInterval) {
            clearInterval(rocketInterval);
            rocketInterval = null;
        }
        let load = document.getElementById('master-loading-overlay');
        if(load) load.remove();
    }
    
    if (!window.html2canvas) {
        let script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script);
    }

    window.capNhatGioChot = function() {
        const timeEl = document.getElementById('realtime-header');
        if(timeEl) {
            const now = new Date();
            timeEl.innerText = '⏰ REALTIME ' + now.getHours() + ':' + (now.getMinutes()<10?'0':'') + now.getMinutes();
        }
    };

    // =========================================================================
    // PHÒNG 1: BỘ NÃO ĐIỀU HÀNH
    // =========================================================================
    const STATE_KEY = 'tamhoa_master_state';
    let currentState = GM_getValue(STATE_KEY, 'IDLE');

    function taoNutBatTu() {
        if(document.getElementById('btn-immortal-menu')) return;
        let btn = document.createElement('button');
        btn.id = "btn-immortal-menu";
        btn.innerHTML = "📊";
        btn.style.cssText = `position:fixed; bottom:40px; left:50%; transform:translateX(-50%); z-index:2147483647; width:50px; height:50px; background:linear-gradient(90deg, #1e3799, #004a99); color:#ffc107; font-weight:900; font-size:24px; border:2px solid #ffc107; border-radius:50%; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; transition: all 0.3s ease;`;

        btn.onmouseover = () => btn.style.transform = "translateX(-50%) scale(1.1)";
        btn.onmouseout = () => btn.style.transform = "translateX(-50%) scale(1)";

        btn.onclick = () => {
            let panel = document.getElementById('super-master-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        };
        document.body.appendChild(btn);
    }

    function taoBangDieuKhienMenu() {
        if(document.getElementById('super-master-panel')) return;
        let panel = document.createElement('div');
        panel.id = 'super-master-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); width: 260px; background: rgba(0, 74, 153, 0.98); border: 3px solid #ffc107; padding: 15px; border-radius: 12px; color: white; z-index: 2147483646; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 5px 25px rgba(0,0,0,0.7);">
                <h3 style="text-align: center; color: #ffc107; margin-top: 0; border-bottom: 1px dashed #ffc107; padding-bottom: 10px; font-weight: 950;">🕹️ CHỌN TOOL </h3>
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <label id="lbl-dt" style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.3s;">
                        <input type="radio" name="tool-select" id="radio-dt" style="accent-color: #ffc107; width: 20px; height: 20px; margin-right: 10px;">
                        📊 BÁO CÁO DOANH THU
                    </label>
                    <label id="lbl-sk" style="display: flex; align-items: center; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.3s;">
                        <input type="radio" name="tool-select" id="radio-sk" style="accent-color: #ffc107; width: 20px; height: 20px; margin-right: 10px;">
                        🏥 BÁO CÁO SỨC KHỎE
                    </label>
                </div>
                <button id="btn-start-flow" disabled style="background: linear-gradient(90deg, #f1c40f, #e67e22); color: black; border: none; width: 100%; padding: 12px; font-weight: 900; font-size: 14px; border-radius: 5px; cursor: not-allowed; opacity: 0.5;">🚀 BẮT ĐẦU </button>
            </div>
        `;
        document.body.appendChild(panel);

        const radDT = document.getElementById('radio-dt'), radSK = document.getElementById('radio-sk');
        const btnStart = document.getElementById('btn-start-flow');
        const lblDT = document.getElementById('lbl-dt'), lblSK = document.getElementById('lbl-sk');

        radDT.onchange = () => {
            lblSK.style.opacity = '0.4'; lblDT.style.opacity = '1';
            btnStart.disabled = false; btnStart.style.cursor = 'pointer'; btnStart.style.opacity = '1';
        };
        radSK.onchange = () => {
            lblDT.style.opacity = '0.4'; lblSK.style.opacity = '1';
            btnStart.disabled = false; btnStart.style.cursor = 'pointer'; btnStart.style.opacity = '1';
        };

        btnStart.onclick = () => {
            let task = radDT.checked ? 'DT_GO_HOME' : 'SK_GO_HOME';
            GM_setValue(STATE_KEY, task);
            panel.style.display = 'none';
            window.location.href = "https://bi.thegioididong.com/";
        };
    }

    async function boNaoKiemTraTrangThai() {
        if (currentState === 'IDLE') { taoNutBatTu(); taoBangDieuKhienMenu(); return; }
        hienThiVuTruLoading();

        try {
            if (currentState === 'DT_GO_HOME') { await laiVaoTiem('DT_FETCH1'); }
            else if (currentState === 'SK_GO_HOME') { await laiVaoTiem('SK_FETCH'); }
            else if (currentState === 'DT_FETCH1') { await xuLyDoanhThu_Trang1(); }
            else if (currentState === 'DT_FETCH2' && window.location.href.includes("thi-dua")) { await xuLyDoanhThu_Trang2(); }
            else if (currentState === 'SK_FETCH') { await xuLySucKhoe_Full(); }
            else { resetTrangThai("Trạng thái bị lỗi, đã thiết lập lại hệ thống."); }
        } catch (error) { resetTrangThai("Lỗi hệ thống: " + error.message); }
    }

    async function laiVaoTiem(nextState) {
        await delay(1000);
        let linkTamHoa = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('TGD_DON_BHO'));
        if (linkTamHoa) { GM_setValue(STATE_KEY, nextState); linkTamHoa.click(); }
        else { resetTrangThai("Không tìm thấy siêu thị. Kiểm tra lại quyền BI."); }
    }

    function resetTrangThai(msg) {
        if(msg) alert(msg);
        GM_setValue(STATE_KEY, 'IDLE'); tatVuTruLoading(); taoNutBatTu(); taoBangDieuKhienMenu();
    }

    // =========================================================================
    // XƯỞNG DOANH THU (dtht)
    // =========================================================================
    async function xuLyDoanhThu_Trang1() {
        let tab = await waitForElement('#tab-bcdtnh', 15000); tab.click();
        let filterDivs = await waitForElement('.filter-option-inner-inner', 10000);
        let allDivs = document.querySelectorAll('.filter-option-inner-inner');
        let dropdownBtn = null;

        for (let div of allDivs) {
            if (div.innerText.trim() === 'Lũy kế Tháng' || div.innerText.trim() === 'Realtime') {
                dropdownBtn = div.closest('button'); break;
            }
        }

        if (dropdownBtn && !dropdownBtn.innerText.includes('Realtime')) {
            dropdownBtn.click(); await delay(1000);
            let options = document.querySelectorAll('a.dropdown-item span.text, li a');
            let found = false;
            for (let opt of options) {
                if (opt.innerText.trim() === 'Realtime') { opt.click(); found = true; break; }
            }
            if (!found) throw new Error("Không tìm thấy bộ lọc Realtime");
        }

        let dataTong = null;
        for(let scan = 0; scan < 20; scan++) {
            await delay(1500);
            let rows = document.querySelectorAll('tr');
            for (let i = 0; i < rows.length; i++) {
                let text = rows[i].textContent.trim();
                // Filter exclusion rule applied here directly
                if (text.includes("Tổng") && text.includes("%") && !text.includes("Việt Bí")) {
                    let cells = rows[i].querySelectorAll('td');
                    if (cells.length >= 8) {
                        dataTong = { dt: cells[3].textContent.trim(), target: cells[4].textContent.trim(), pct: cells[5].textContent.trim(), tracham: cells[7].textContent.trim() };
                        break;
                    }
                }
            }
            if (dataTong && dataTong.dt !== "") break;
        }

        if (!dataTong || dataTong.dt === "") throw new Error("Chưa lấy được số Tổng Doanh Thu.");
        GM_setValue('dtht_data_trang1', JSON.stringify(dataTong));
        GM_setValue(STATE_KEY, 'DT_FETCH2');
        window.location.href = "https://bi.thegioididong.com/thi-dua?id=-1&tab=1&rt=1&dm=1";
    }

    async function xuLyDoanhThu_Trang2() {
        await waitForElement('body', 15000); await delay(3000);

        let data1_str = GM_getValue('dtht_data_trang1');
        let data1 = data1_str ? JSON.parse(data1_str) : { dt: "0", target: "500", pct: "0", tracham: "0" };

        let rawText = document.body.innerText; let lines = rawText.split('\n'); let cleanText = "";
        for(let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            // Exclusion rule maintained perfectly
            if (line === "" || /^Cụm\s+\d+$/.test(line) || /^Trở lại$/.test(line) || line.includes("Việt Bí")) continue;
            cleanText += line + "\n";
        }

        GM_setValue(STATE_KEY, 'IDLE');
        hienThiCommanderDoanhThu(data1, cleanText);
        tatVuTruLoading(); taoNutBatTu(); taoBangDieuKhienMenu();
    }

    function hienThiCommanderDoanhThu(tong, chiTiet) {
        let oldOvl = document.getElementById('dtht-commander-overlay'); if (oldOvl) oldOvl.remove();
        let div = document.createElement('div'); div.id = 'dtht-commander-overlay';
        div.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483645; background:rgba(0,0,0,0.8); overflow-y:auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;";

        div.addEventListener('click', (e) => {
            const btn = e.target.closest('.st-picker-btn');
            if (btn) {
                e.stopPropagation();
                unsafeWindow.showStickerPopupDtht(e, btn, btn.getAttribute('data-name'));
            }
        });

        const cssGoc = `
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            .th-container { padding: 5px; width: 100%; max-width: 600px; margin: 10px auto; position:relative; }
            :root { --primary: #004a99; --accent: #ffc107; --bg: #f0f2f5; --success: #28a745; --danger: #dc3545; --black: #000; }
            .input-card { background: white; padding: 10px; border-radius: 12px; margin-bottom: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            input, textarea { border: 2px solid #ddd; border-radius: 8px; padding: 8px; font-size: 15px; font-weight: 900; width: 100%; margin-bottom: 4px; }
            .mode-group { display: flex; gap: 4px; margin-bottom: 6px; }
            .mode-btn { flex: 1; padding: 10px 2px; border: 2px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-weight: 900; font-size: 10px; text-transform: uppercase; }
            .mode-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
            .btn-main { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; font-weight: 900; font-size: 15px; cursor: pointer; text-transform: uppercase; }
            #finalReportArea { background: var(--bg); padding: 8px; width: 100%; border-radius: 16px; display: flex; flex-direction: column; gap: 8px;}
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 100%; }
            .stat-box { background: #fff; padding: 15px 10px; border-radius: 16px; border: 2px solid var(--primary); text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.08); display: flex; flex-direction: column; justify-content: center; align-items: center; transition: all 0.3s ease; }
            .stat-label { font-size: 11px; font-weight: 900; color: #666; text-transform: uppercase; margin-bottom: 6px; }
            .stat-val { font-size: 28px !important; font-weight: 950 !important; color: var(--primary); text-shadow: 0.5px 0.5px 0px #000, 0px 0px 0px #000; line-height: 1.1; }
            .capture-frame { width: 100%; }
            .group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 0; width: 100%; }
            .group-card { background: #fff; border: 1px solid #e0e6ed; padding: 10px 8px; border-radius: 16px; border-bottom: none; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); width: 100%; flex: 1 1 48%;}
            .group-name { font-size: 14px !important; font-weight: 950 !important; color: var(--black); border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase; min-height: 2.6em; line-height: 1.2; display: flex; align-items: center; gap: 4px; word-break: break-word; }
            .group-sticker { font-size: 22px !important; display: inline-block; transform: translateY(-1px); }
            .group-stats { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: auto; }
            .group-num { font-size: 20px !important; font-weight: 950 !important; color: var(--primary); text-shadow: 0.3px 0.3px 0px var(--primary); }
            .group-pct { font-size: 18px !important; font-weight: 950 !important; padding: 4px 8px; border-radius: 8px; text-shadow: 0.3px 0.3px 0px rgba(0,0,0,0.2); }
            #lienText { background: #fffbe6; border: 2px dashed var(--primary); font-weight: 900; height: 220px; margin-top: 8px; font-size: 12px; padding: 10px; border-radius: 8px; width:100%; line-height: 1.5; }
            .overlay { display:none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2147483648; }
            .settings-panel { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; width:95%; max-width:550px; max-height:85vh; padding:15px; border-radius:12px; z-index:2147483649; flex-direction: column; }
            #groupChecklist { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; border: 1px solid #eee; padding: 5px; border-radius: 8px; }
            .chk-item { display: flex; flex-direction: column; padding: 10px 5px; border-bottom: 1px solid #f0f0f0; gap: 8px; }
            .chk-top { display: flex; align-items: center; justify-content: space-between; width: 100%; }
            .chk-left { display: flex; align-items: center; gap: 8px; flex: 1; }
            .st-picker-btn { cursor: pointer; font-size: 28px; padding: 4px 8px; background: #f0f0f0; border-radius: 6px; flex-shrink: 0; }
            .chk-name-text { font-weight: 900; font-size: 9px; text-transform: uppercase; line-height: 1.2; color: #666; }
            .nickname-input { font-size: 12px; padding: 6px; border: 1px solid #ccc; border-radius: 6px; width: 100%; font-weight: 900; text-transform: uppercase; background: #fffdf0; }
            .g-vis { width: 22px; height: 22px; flex-shrink: 0; cursor: pointer; }
            .sticker-popup { display: none; position: fixed; background: white; border: 3px solid var(--primary); padding: 8px; border-radius: 15px; z-index: 2147483650; width: 96%; max-width: 550px; max-height: 75vh; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.5); flex-direction: column; }
            .sticker-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; overflow-y: auto; overflow-x: hidden; padding: 10px; flex: 1; }
            .st-opt { cursor: pointer; font-size: 30px; text-align: center; padding: 8px; }
            .st-close { background: #f0f0f0; text-align: center; padding: 12px; font-weight: 900; border-radius: 8px; margin-top: 5px; cursor: pointer; }
            .pct-high { background: var(--success); color: #fff; } .pct-mid { background: var(--accent); color: #000; } .pct-low { background: var(--danger); color: #fff; }
            .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            .setting-row { background: #f9f9f9; padding: 10px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #ddd; }
        `;

        div.innerHTML = `
            <style>${cssGoc}</style>
            <div class="th-container" id="dthtMainContainer">
                <div class="input-card" style="display:block;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; width: 100%; margin-bottom: 12px;">
                        <div style="cursor:pointer; background:#ff3b30; color:white; border-radius:6px; font-size:11px; font-weight:900; padding:10px 0; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="document.getElementById('dtht-commander-overlay').remove();">❌ ĐÓNG</div>
                        <div style="cursor:pointer; background:#6c757d; color:white; border-radius:6px; font-size:11px; font-weight:900; padding:10px 0; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.openSettingsDtht()">⚙️ CÀI ĐẶT</div>
                    </div>
                    <div class="mode-group">
                        <button class="mode-btn active" id="btnNow" onclick="window.setModeDtht('now')">🔥 HIỆN TẠI</button>
                        <button class="mode-btn" id="btnMorning" onclick="window.setModeDtht('morning')">☀️ CA SÁNG</button>
                        <button class="mode-btn" id="btnEnd" onclick="window.setModeDtht('end')">🏁 CUỐI NGÀY</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 6px;">
                        <input type="number" id="inpDT" placeholder="DT (Tr)" inputmode="numeric">
                        <input type="number" id="inpTG" placeholder="TG %" inputmode="numeric">
                        <input type="text" id="inpTime" placeholder="Giờ">
                    </div>
                    <textarea id="inpRaw" rows="3" placeholder="Dán dữ liệu BI vào đây..."></textarea>
                    <button class="btn-main" onclick="window.renderDailyDtht()">🚀 XUẤT CHIẾN SOI NGÀY</button>
                </div>

                <div id="outputArea" style="display:none;">
                    <div id="finalReportArea">
                        <div id="realtime-header" style="text-align: center; color: #fff; background: #004a99; padding: 6px 0; font-size: 14px; font-weight: 950; border-radius: 8px; margin-bottom: 8px; border: 2px solid #ffc107;">⏰ REALTIME --:--</div>
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="stat-label">THỰC/TARGET (TR)</div>
                                <div id="outDTStr" class="stat-val" style="color: #d35400;">0/0</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">% ĐẠT</div>
                                <div id="outDTPct" class="stat-val">0%</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">TRẢ GÓP</div>
                                <div id="outTGVal" class="stat-val">0%</div>
                            </div>
                            <div class="stat-box" id="boxDatCount">
                                <div class="stat-label">NHÓM ĐẠT</div>
                                <div id="outDatCount" class="stat-val" style="color: #000;">0/18</div>
                            </div>
                        </div>

                        <div class="capture-frame">
                            <div class="group-grid" id="outGrid"></div>
                        </div>
                    </div>
                    <div class="btn-grid">
                        <button class="btn-main" id="btnCopy" style="background:var(--black); color:var(--accent);" onclick="window.copyToLienDtht()">📋 COPY CHỮ</button>
                        <button class="btn-main" id="btnCap" style="background: #e67e22; color: white;" onclick="window.captureReportDtht()">📸 CHỤP ẢNH</button>
                    </div>
                    <textarea id="lienText" readonly></textarea>
                </div>
            </div>

            <div class="overlay" id="dtht_overlay" onclick="window.closeSettingsDtht()"></div>
            <div class="settings-panel" id="dtht_settingsPanel">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; color:var(--primary); font-weight:900; font-size:16px;">⚙️ CÀI ĐẶT DOANH THU</h3>
                    <span style="cursor:pointer; font-size:22px;" onclick="window.closeSettingsDtht()">✖</span>
                </div>
                <div class="setting-row">
                    <label style="display:block; font-weight:900; font-size:11px; margin-bottom:5px; color:var(--danger)">🎯 TARGET DOANH THU NGÀY (TR):</label>
                    <input type="number" id="setTargetDay" placeholder="Ví dụ: 500" inputmode="numeric" style="margin-bottom:0; border-color:var(--primary)">
                </div>
                <div id="groupChecklist"></div>
                <button onclick="window.saveSettingsDtht()" style="width:100%; background:var(--success); color:white; border:none; padding:12px; border-radius:8px; font-weight: 900; margin-top: 10px;">LƯU LẠI</button>
            </div>
            <div id="dtht_stickerPopup" class="sticker-popup">
                <div class="sticker-grid" id="stickerGrid"></div>
                <div class="st-close" onclick="document.getElementById('dtht_stickerPopup').style.display='none'">ĐÓNG</div>
            </div>
        `;
        document.body.appendChild(div);

        unsafeWindow.currentModeDtht = 'now';
        unsafeWindow.allParsedGroupsDtht = [];
        unsafeWindow.groupConfigsDtht = JSON.parse(localStorage.getItem('dthtSlimConfigs')) || {};

        document.getElementById('inpDT').value = tong.dt.replace(/,/g, '');
        document.getElementById('inpTG').value = tong.tracham.replace(/%/g, '').trim();
        unsafeWindow.masterTargetDtht = parseFloat(tong.target.replace(/,/g, '')) || 500;
        document.getElementById('setTargetDay').value = unsafeWindow.masterTargetDtht;
        document.getElementById('inpRaw').value = chiTiet;
        document.getElementById('inpTime').value = new Date().getHours() + "H" + (new Date().getMinutes()<10?'0':'') + new Date().getMinutes();

        unsafeWindow.activePickerBtnDtht = null;
        unsafeWindow.activeGroupNameDtht = "";

        unsafeWindow.setModeDtht = function(mode) {
            unsafeWindow.currentModeDtht = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            if(mode === 'now') document.getElementById('btnNow').classList.add('active');
            if(mode === 'morning') document.getElementById('btnMorning').classList.add('active');
            if(mode === 'end') document.getElementById('btnEnd').classList.add('active');
            unsafeWindow.renderDailyDtht();
        }

        unsafeWindow.captureReportDtht = function() {
            const area = document.getElementById('finalReportArea'), btn = document.getElementById('btnCap');
            btn.innerText = "⏳ ĐANG CHỤP..."; document.getElementById('dtht-commander-overlay').scrollTo(0,0);
            setTimeout(() => {
                html2canvas(area, { scale: 3, useCORS: true, backgroundColor: "#f0f2f5" }).then(canvas => {
                    const timeStr = document.getElementById('inpTime').value || "NOW";
                    const link = document.createElement('a'); link.download = `DTHT_${timeStr}.png`;
                    link.href = canvas.toDataURL("image/png"); link.click();
                    btn.innerText = "✅ XONG!"; setTimeout(() => { btn.innerText = "📸 CHỤP ẢNH"; }, 1500);
                });
            }, 300);
        }

        unsafeWindow.copyToLienDtht = function() {
            const textarea = document.getElementById('lienText'), btnCopy = document.getElementById('btnCopy');
            textarea.select(); textarea.setSelectionRange(0, 99999);
            try { document.execCommand('copy'); btnCopy.innerText = "✅ ĐÃ COPY!"; btnCopy.style.background = "#28a745"; setTimeout(() => { btnCopy.innerText = "📋 COPY CHỮ"; btnCopy.style.background = "var(--black)"; }, 2000); } catch (err) { alert("Lỗi copy!"); }
        };

        unsafeWindow.trimNameDtht = function(name) {
            return name.replace(/Thi đua doanh thu |Thi đua số lượng |Thi đua |BC Thi đua |Nhóm hàng /gi, "")
                       .replace("SMARTPHONE FLAGSHIP & TABLET ANDROID", "Flagship")
                       .replace("Pin sạc dự phòng", "Sạc dự phòng")
                       .replace("FECREDIT, SHINHAN, SAMSUNG FINANCE+", "Góp(FE/SH/SS)")
                       .trim();
        }

        unsafeWindow.openSettingsDtht = function() {
            document.getElementById('setTargetDay').value = unsafeWindow.masterTargetDtht;
            const list = document.getElementById('groupChecklist'); list.innerHTML = "";
            let filteredGroups = unsafeWindow.allParsedGroupsDtht.filter(g => g.name.length < 50);
            let sortedGroups = filteredGroups.sort((a,b) => (b.t > 0) - (a.t > 0) || a.name.localeCompare(b.name));
            sortedGroups.forEach(g => {
                const conf = unsafeWindow.groupConfigsDtht[g.name] || { visible: true, sticker: "📦", nickname: "" };
                list.innerHTML += `
                    <div class="chk-item">
                        <div class="chk-top">
                            <div class="chk-left">
                                <span class="st-picker-btn" data-name="${g.name}">${conf.sticker}</span>
                                <span class="chk-name-text">${g.name}</span>
                            </div>
                            <input type="checkbox" class="g-vis" data-name="${g.name}" ${conf.visible?'checked':''}>
                        </div>
                        <input type="text" class="nickname-input" placeholder="Đặt biệt danh..." value="${conf.nickname || ''}">
                    </div>`;
            });
            let ovl = document.getElementById('dtht_overlay'); let pnl = document.getElementById('dtht_settingsPanel');
            if(ovl) ovl.style.display = 'block';
            if(pnl) pnl.style.display = 'flex';
        }

        unsafeWindow.showStickerPopupDtht = function(event, btn, gName) {
            event.stopPropagation();
            unsafeWindow.activePickerBtnDtht = btn;
            unsafeWindow.activeGroupNameDtht = gName;
            document.getElementById('stickerGrid').innerHTML = STICKERS.map(s => `<div class="st-opt" onclick="window.selectStickerDtht('${s}')">${s}</div>`).join('');
            document.getElementById('dtht_stickerPopup').style.display = 'flex';
        }

        unsafeWindow.selectStickerDtht = function(st) {
            if(unsafeWindow.activePickerBtnDtht) unsafeWindow.activePickerBtnDtht.innerText = st;
            if(!unsafeWindow.groupConfigsDtht[unsafeWindow.activeGroupNameDtht]) unsafeWindow.groupConfigsDtht[unsafeWindow.activeGroupNameDtht] = { visible: true, sticker: "📦", nickname: "" };
            unsafeWindow.groupConfigsDtht[unsafeWindow.activeGroupNameDtht].sticker = st;
            document.getElementById('dtht_stickerPopup').style.display = 'none';
        }

        unsafeWindow.closeSettingsDtht = function() {
            let ovl = document.getElementById('dtht_overlay'); let pnl = document.getElementById('dtht_settingsPanel');
            if(ovl) ovl.style.display = 'none';
            if(pnl) pnl.style.display = 'none';
        }

        unsafeWindow.saveSettingsDtht = function() {
            unsafeWindow.masterTargetDtht = parseFloat(document.getElementById('setTargetDay').value) || 500;
            document.querySelectorAll('.chk-item').forEach(item => {
                const chk = item.querySelector('.g-vis'), name = chk.getAttribute('data-name');
                const st = item.querySelector('.st-picker-btn').innerText, nick = item.querySelector('.nickname-input').value.trim();
                unsafeWindow.groupConfigsDtht[name] = { visible: chk.checked, sticker: st, nickname: nick };
            });
            localStorage.setItem('dthtSlimConfigs', JSON.stringify(unsafeWindow.groupConfigsDtht));
            unsafeWindow.closeSettingsDtht();
            unsafeWindow.renderDailyDtht();
        }

        unsafeWindow.renderDailyDtht = function() {
            const raw = document.getElementById('inpRaw').value; const dt = parseFloat(document.getElementById('inpDT').value) || 0; const tg = parseFloat(document.getElementById('inpTG').value) || 0; const time = document.getElementById('inpTime').value; const mode = unsafeWindow.currentModeDtht;
            const masterTarget = parseFloat(document.getElementById('setTargetDay')?.value) || 500;

            if(!raw) return;

            const lines = raw.split('\n').map(l => l.trim()).filter(l => l !== "");
            unsafeWindow.allParsedGroupsDtht = []; let groupIndices = [];
            for (let i = 0; i < lines.length; i++) { if ((lines[i].includes("Thi đua") || lines[i].includes("Nhóm hàng")) && lines[i].length < 100) groupIndices.push(i); }

            const exN = t => {
                let m = t.match(/-?[\d\.]+/);
                return m ? parseFloat(m[0].replace(/,/g, '')) : 0;
            };
            // Rounded extraction priorities (2nd number)
            const exP = t => {
                let m = t.match(/-?[\d\.]+/g);
                return m ? (m.length >= 2 ? parseFloat(m[1].replace(/,/g, '')) : parseFloat(m[0].replace(/,/g, ''))) : 0;
            };

            for (let k = 0; k < groupIndices.length; k++) {
                let startIdx = groupIndices[k]; let endIdx = (k < groupIndices.length - 1) ? groupIndices[k+1] : lines.length;
                let name = unsafeWindow.trimNameDtht(lines[startIdx]); let r = 0, t = 0, p = 0;
                for (let j = startIdx + 1; j < endIdx; j++) {
                    let l = lines[j], nl = lines[j+1] || "";
                    if (l.includes("Realtime")) r = exN(l) || exN(nl);
                    if (l.includes("Target Ngày") && !l.includes("% HT")) t = exN(l) || exN(nl);
                    if (l.includes("% HT")) p = exP(l) || exP(nl);
                }
                if(name && (r > 0 || t > 0)) unsafeWindow.allParsedGroupsDtht.push({ name, r, t, p });
            }

            let dList = unsafeWindow.allParsedGroupsDtht.filter(g => unsafeWindow.groupConfigsDtht[g.name]?.visible !== false).sort((a,b) => (b.t > 0) - (a.t > 0) || b.p - a.p);
            let gridHtml = "", datCount = 0;
            dList.forEach(g => {
                if(g.t > 0 && g.p >= 100) datCount++;
                let pDisplay = g.r === 0 ? 0 : lamTronTamHoa(g.p);
                let pCl = g.r === 0 ? "" : (g.p >= 100 ? "pct-high" : (g.p >= 50 ? "pct-mid" : "pct-low"));
                let fName = unsafeWindow.groupConfigsDtht[g.name]?.nickname || g.name;
                gridHtml += `<div class="group-card"><div class="group-name"><span class="group-sticker">${unsafeWindow.groupConfigsDtht[g.name]?.sticker || "📦"}</span> ${fName}</div><div class="group-stats"><div class="group-num">${g.r}${g.t>0 ? '/'+g.t : ''}</div><div class="group-pct ${pCl}">${pDisplay}%</div></div><div style="width:100%; height:4px; background:#e0e0e0; border-radius:2px; margin-top:6px; overflow:hidden;"><div style="width:${g.r === 0 ? 0 : Math.min(100, g.p)}%; height:100%;" class="${pCl}"></div></div></div>`;
            });

            document.getElementById('outGrid').innerHTML = gridHtml;
            const tGroups = dList.filter(x=>x.t>0).length;

            const elDat = document.getElementById('outDatCount');
            const boxDat = document.getElementById('boxDatCount');
            elDat.innerText = `${datCount}/${tGroups}`;

            if (datCount === tGroups && tGroups > 0) {
                boxDat.style.background = "#FFD700";
                boxDat.style.borderColor = "#e67e22";
                elDat.style.color = "#000";
            } else if (datCount >= (tGroups / 2)) {
                boxDat.style.background = "#e8f8f5";
                boxDat.style.borderColor = "#2ecc71";
                elDat.style.color = "#27ae60";
            } else {
                boxDat.style.background = "#fdedec";
                boxDat.style.borderColor = "#e74c3c";
                elDat.style.color = "#c0392b";
            }

            document.getElementById('outDTStr').innerText = lamTronTamHoa(dt) + "/" + lamTronTamHoa(masterTarget);
            const pDT = ((dt / masterTarget) * 100);
            document.getElementById('outDTPct').innerText = lamTronTamHoa(pDT) + "%"; document.getElementById('outDTPct').style.color = pDT >= 100 ? 'var(--success)' : 'var(--danger)';
            document.getElementById('outTGVal').innerText = lamTronTamHoa(tg) + "%";

            const toSt = num => num.toString().split('').map(d => ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][parseInt(d)] || d).join('');
            let dtTr = lamTronTamHoa(dt), tTr = lamTronTamHoa(masterTarget), pTr = lamTronTamHoa(pDT), tgTr = lamTronTamHoa(tg), thTr = lamTronTamHoa(Math.abs(masterTarget - dt));

            let pre = "", st = "", cauKet = "";
            if (mode === 'now') {
                pre = `🔥 CẬP NHẬT HIỆN TẠI (${time}): `;
                st = pDT >= 100 ? `🎊 Tuyệt vời! Cán đích ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%).` : `📉 Đạt: ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%)\n👉 Thiếu: ${toSt(thTr)}TR`;
                cauKet = "Nhận thông tin push số gấp";
            }
            else if (mode === 'morning') {
                pre = `☀️ KẾT CA SÁNG: `;
                st = pDT >= 100 ? `🎊 Ca sáng tốt! ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%).` : `⚠️ Kết ca sáng: ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%)\n👉 Thiếu: ${toSt(thTr)}TR`;
                cauKet = "Team ca chiều nhận thông tin push số";
            }
            else {
                pre = `🏁 TỔNG KẾT NGÀY: `;
                st = pDT >= 100 ? `🎊 CHÚC MỪNG! Về đích ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%).` : `📉 Về: ${toSt(dtTr)}/${toSt(tTr)}TR (${toSt(pTr)}%)\n👉 Thiếu: ${toSt(thTr)}TR`;
                cauKet = "Team cập nhật doanh thu nghỉ ngơi sớm";
            }

            let txt = `${pre}\n${st}\n💳 TRẢ GÓP: ${toSt(tgTr)}%\n📦 Nhóm hàng đạt/Tổng nhóm: ${datCount}/${tGroups}\n\n`;

            const hG = dList.filter(g => g.t > 0 && g.p >= 100), lG = dList.filter(g => g.t > 0 && g.p < 100);
            if(hG.length > 0) { txt += `✅ NHÓM ĐĐẠT:\n`; hG.forEach(g => txt += `${unsafeWindow.groupConfigsDtht[g.name]?.sticker || "📦"} ${unsafeWindow.groupConfigsDtht[g.name]?.nickname || g.name}: ${toSt(lamTronTamHoa(g.p))}%\n`); txt += `\n`; }
            if(lG.length > 0) { txt += `🔥 NHÓM CHƯA ĐẠT:\n`; lG.forEach(g => txt += `${unsafeWindow.groupConfigsDtht[g.name]?.sticker || "📦"} ${unsafeWindow.groupConfigsDtht[g.name]?.nickname || g.name}: ${toSt(lamTronTamHoa(g.p))}%\n`); }

            txt += `\n🚀 ${cauKet} 💪🔥`;

            document.getElementById('lienText').value = txt;
            document.getElementById('outputArea').style.display = "block";
        };

        window.capNhatGioChot();
        unsafeWindow.renderDailyDtht();
    }

    // =========================================================================
    // XƯỞNG SỨC KHỎE ST (skst & sknv)
    // =========================================================================
    async function chonMenuBangClickGiaLap(indexPha) {
        let nutTongDropdown = document.querySelector('button[data-id="showdatacomprog"]'); if (!nutTongDropdown) return;
        nutTongDropdown.click(); await delay(1000);
        let parentDiv = nutTongDropdown.parentElement;
        if (parentDiv) { let cacTheLinks = parentDiv.querySelectorAll('.dropdown-menu a.dropdown-item'); if (cacTheLinks && cacTheLinks[indexPha - 1]) cacTheLinks[indexPha - 1].click(); }
        await delay(4000);
    }

    async function hutSoThongMinh() {
        let theChuaChu = Array.from(document.querySelectorAll('td')).find(el => el.innerText && el.innerText.includes("BP All In One"));
        if (theChuaChu) {
            let hangNgang = theChuaChu.closest('tr');
            if (hangNgang) { let nutCong = hangNgang.querySelector('.fa-plus') || hangNgang.querySelector('i[class*="fa-plus"]'); if (nutCong) { nutCong.click(); await delay(2000); } }
        } else { await delay(1500); }
        let overlay = document.getElementById('skst-super-overlay'); if (overlay) overlay.style.display = 'none';
        let rawText = document.body.innerText; if (overlay) overlay.style.display = 'block'; return rawText;
    }

    async function xuLySucKhoe_Full() {
        injectSKSTHTML();
        let overlay = document.getElementById('skst-super-overlay'); if (overlay) overlay.style.display = 'block';

        await delay(3000);

        let txtPha1 = Array.from(document.querySelectorAll('.card, .cum-thi-dua, .card-tg-tong')).map(el => el.innerText).join('\n');
        let input1 = document.getElementById('i1'); if(input1) input1.value = txtPha1;

        let tabNV = document.getElementById('tab-bcnv') || document.getElementById('tab-bcdtnv') || Array.from(document.querySelectorAll('a, button, .nav-link')).find(el => el.innerText.includes('BC Doanh thu theo nhân viên'));
        if (tabNV) { tabNV.click(); await delay(3000); }

        let textPha2 = await hutSoThongMinh(); let input2 = document.getElementById('i2'); if(input2) input2.value = textPha2;
        await chonMenuBangClickGiaLap(2); let textPha3 = await hutSoThongMinh(); let input3 = document.getElementById('i3'); if(input3) input3.value = textPha3;
        await chonMenuBangClickGiaLap(3); let textPha4 = await hutSoThongMinh(); let input4 = document.getElementById('i4'); if(input4) input4.value = textPha4;

        let tabTG = document.getElementById('tab-bctg');
        if (tabTG) {
            tabTG.click(); await delay(1500);
            let menuTraCham = document.getElementById('mode-view-bctg');
            if (menuTraCham) {
                menuTraCham.value = "1"; menuTraCham.dispatchEvent(new Event('change')); await delay(3000);
                let bangTG = document.querySelector('#pane-bctg'); let input5 = document.getElementById('i5');
                if (bangTG && input5) input5.value = bangTG.innerText;
            }
        }

        GM_setValue(STATE_KEY, 'IDLE');
        if (typeof unsafeWindow.skst_masterProcess === 'function') unsafeWindow.skst_masterProcess();
        tatVuTruLoading(); taoNutBatTu(); taoBangDieuKhienMenu();
    }

    function injectSKSTHTML() {
        if(document.getElementById('skst-super-overlay')) return;

        let style = document.createElement('style');
        style.innerHTML = `
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            :root { --primary: #004a99; --bg: #f0f2f5; --success: #c6efce; --mid: #ffeb9c; --bad: #ffc7ce; --text-bad: #9c0006; --highlight: #e67e22; }
            .header-controls { background: white; padding: 5px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px; margin-bottom: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            textarea.sk-ta { width: 100%; height: 60px !important; font-size: 13px !important; font-weight: 900 !important; border: 2px solid #000 !important; border-radius: 8px !important; padding: 8px !important; box-sizing: border-box; background: #fff !important; color: #000 !important; }
            .btn-group { display: flex; gap: 4px; margin-top: 5px; }
            .btn-sk { flex: 1; padding: 6px 10px; border: none; border-radius: 4px; font-weight: 900; color: white; font-size: 11px; cursor: pointer; text-align: center; }
            .sk-header-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-bottom: 6px; width: 100%; }
            .sk-card { background: #fff; padding: 12px 5px; border-radius: 12px; text-align: center; border: 3px solid var(--primary); min-height: 90px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
            .sk-label { font-size: 13px; font-weight: 900; color: #666; margin-bottom: 6px; }
            .sk-value { font-size: 38px !important; font-weight: 900 !important; color: var(--primary); padding: 10px 0; line-height: 1.2; }
            .matrix td { font-size: 14px !important; font-weight: 900 !important; color: #000 !important; }
            .sk-groups-wrapper, .excel-table-wrapper { background: white; border-radius: 12px; overflow-x: auto; border: 2px solid #004a99; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 4px; width: 100%; }
            .sk-table { border-collapse: collapse; text-align: center; table-layout: auto; width: 100%; min-width: max-content; }
            .sk-table th, .sk-table td { border: 1px solid #aaa; padding: 6px 4px; font-weight: 900; font-size: 11px; white-space: nowrap; }
            .sk-table thead th { background: var(--primary); color: white; font-size: 14px !important; font-weight: 900 !important; padding: 12px 6px !important; }
            .fixed-col { width: 50px; min-width: 50px; text-align: center; font-size: 14px !important; }
            .stk-display { font-size: 18px; display: block; margin-bottom: 2px; }
            .sticky-col { position: sticky; left: 0; background: #fff !important; z-index: 5; border-right: 2px solid var(--primary); color: #000 !important; font-size: 11px; text-align: left; width: 60px; min-width: 60px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
            .bg-good { background-color: var(--success) !important; color: #006100 !important; font-weight: 900 !important; }
            .bg-mid { background-color: var(--mid) !important; color: #9c5700 !important; font-weight: 900 !important; }
            .bg-bad { background-color: var(--bad) !important; color: #9c0006 !important; font-weight: 900 !important; }
            .bg-zero { background-color: #ffc7ce !important; color: #9c0006 !important; font-weight: 900 !important; }
            .sk-groups-table td span.main-percent { display: block; font-size: 24px !important; font-weight: 900 !important; color: #000 !important; padding: 5px 0; }
            .sk-groups-table td span.sub-info { display: block; font-size: 16px !important; font-weight: 900 !important; color: #000 !important; margin-top: 4px; }
            .sk-groups-table td span.remain-info { display: block; font-size: 14px !important; font-weight: 900 !important; color: #d63031 !important; }
            .reward-panel { display: none !important; background: #fff; margin-top: 15px; border-radius: 8px; border: 2px solid #ffd700; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            .reward-header { background: linear-gradient(90deg, #1e3799, #004a99); color: #fff; padding: 10px; text-align: center; font-weight: 900; font-size: 13px; text-transform: uppercase; }
            .reward-row { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px dashed #eee; font-size: 12px; }
            .reward-name { font-weight: 900; color: #004a99; } .reward-value { font-weight: 900; color: #d63031; }
            .input-container { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; background: #f0f2f5; padding: 8px; border-radius: 8px; }
            .input-item { display: flex; flex-direction: column; gap: 3px; }
            .input-item label { font-size: 9px; font-weight: 900; color: #004a99; text-align: center; }

            .overlay { display:none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:2147483648; }
            .settings-panel { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; width:98%; max-width:550px; padding:15px; border-radius:12px; z-index:2147483649; max-height: 90vh; overflow-y: auto; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            .detail-panel { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; width:98%; max-width:600px; padding:10px; border-radius:8px; z-index:2147483649; max-height: 98vh; overflow-y: auto; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            #captureArea { background: white; padding: 15px; border: 3px solid var(--primary); border-radius: 8px; }
            .detail-title { text-align: center; font-size: 20px; color: var(--primary); margin: 0; font-weight: 900; }
            .detail-subtitle { text-align: center; font-size: 13px; font-weight: 900; color: #d63031; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
            .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
            .info-box { border: 1px solid #ddd; padding: 5px; border-radius: 5px; text-align: center; background: #fafafa; display: flex; flex-direction: column; justify-content: center; }
            .info-val { font-size: 18px; color: var(--primary); font-weight: 900; }
            .info-label { font-size: 11px; font-weight: 900; margin-bottom: 5px; }
            .detail-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .detail-table th { background: #f0f0f0; font-size: 11px; padding: 6px 4px; border: 1px solid #aaa; font-weight: 900; color: #000 !important; }
            .detail-table td { font-size: 13px; padding: 6px 4px; border: 1px solid #aaa; font-weight: 900; text-align: center; }
            .info-sub { font-size: 11px !important; color: #d63031 !important; margin-top: 2px !important; font-weight: 900 !important; display: block !important; }
            .alias-input { width: 100%; font-size: 12px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-weight: 900; background:#fffdf0; }
            .skst-sticker-btn { cursor:pointer; font-size:24px; padding:2px 6px; background:#f0f0f0; border-radius:4px; flex-shrink:0;}

            .sticker-popup { display: none; position: fixed; background: white; border: 3px solid var(--primary); padding: 8px; border-radius: 15px; z-index: 2147483650; width: 96%; max-width: 550px; max-height: 75vh; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.5); flex-direction: column; }
            .sticker-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; overflow-y: auto; overflow-x: hidden; padding: 10px; flex: 1; }
            .st-opt { cursor: pointer; font-size: 30px; text-align: center; padding: 8px; }
            .st-close { background: #f0f0f0; text-align: center; padding: 12px; font-weight: 900; border-radius: 8px; margin-top: 5px; cursor: pointer; }
        `;
        document.head.appendChild(style);

        let overlay = document.createElement('div');
        overlay.id = "skst-super-overlay";
        overlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); z-index:2147483645; display:none; overflow-y:auto; padding-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`;

        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('.skst-sticker-btn');
            if (btn) {
                e.stopPropagation();
                unsafeWindow.skst_showStickerPopup(e, btn, btn.getAttribute('data-id'));
            }
        });

        overlay.innerHTML = `
            <div class="header-controls">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-weight: 900; color: #004a99; font-size: 13px;">📊 BẢNG SỨC KHỎE ST</span>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="window.skst_openSettings()" style="background: #6c757d; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 900; cursor: pointer; font-size: 11px;">⚙️ CÀI ĐẶT</button>
                        <button onclick="document.getElementById('skst-super-overlay').remove()" style="background: #d63031; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 900; cursor: pointer; font-size: 11px;">ĐÓNG ❌</button>
                    </div>
                </div>
                <div class="input-container">
                    <div class="input-item"><label>1.SKST</label><textarea class="sk-ta" id="i1"></textarea></div>
                    <div class="input-item"><label>2.D.Thu</label><textarea class="sk-ta" id="i2"></textarea></div>
                    <div class="input-item"><label>3.N.HÀNG</label><textarea class="sk-ta" id="i3"></textarea></div>
                    <div class="input-item"><label>4.B.Kèm</label><textarea class="sk-ta" id="i4"></textarea></div>
                    <div class="input-item"><label>5.T.Góp</label><textarea class="sk-ta" id="i5"></textarea></div>
                </div>
                <div class="btn-group">
                    <button class="btn-sk" style="background:#004a99" onclick="window.skst_masterProcess()">Xuất Dữ Liệu ⚡</button>
                    <button class="btn-sk" style="background:#28a745" onclick="window.skst_captureReport()">Chụp Hình 📷</button>
                    <button class="btn-sk" style="background:#e67e22" onclick="window.skst_generateFullReport()">Copy Nhận Xét 🚀</button>
                    <button class="btn-sk" style="background:#8e44ad; font-weight:900;" onclick="window.skst_toggleReward()">THƯỞNG 🏆</button>
                </div>
            </div>
            </div>
            <div id="reportOutput" style="display:none; background:#fff; padding:10px; margin:10px; border-radius:8px; border:2px solid #004a99; white-space:pre-wrap; font-size:12px; font-weight:900;"></div>
            <div id="screenshotArea" style="background: var(--bg); padding: 8px; width: fit-content; min-width: 100%; box-sizing: border-box;">
                <div id="skStore" class="sk-header-row" style="display:none;"></div>
                <div id="skGroups" class="sk-groups-wrapper" style="display:none;"><table class="sk-table sk-groups-table"><thead><tr id="gh"></tr></thead><tbody id="gb"></tbody></table></div>
                <div id="reportArea" class="excel-table-wrapper" style="display:none;"><table class="sk-table matrix"><thead><tr id="mh"></tr></thead><tbody id="mb"></tbody></table></div>
                <div id="rewardOutput" class="reward-panel"></div>
            </div>

            <div class="overlay" id="setOverlay" onclick="window.skst_closeSettings()"></div>
            <div class="settings-panel" id="settingsPanel">
                <h3 style="text-align: center; color: #004a99; font-weight: 900; margin: 0 0 15px 0;">⚙️ CÀI ĐẶT SỨC KHỎE ST</h3>
                <div style="border: 2px solid orange; border-radius: 8px; padding: 15px 10px 10px 10px; margin-bottom: 20px; position: relative; background: #fffbe6;">
                    <div style="font-size: 11px; font-weight: 900; color: #d35400; background: #fff; padding: 0 8px; position: absolute; top: -12px; left: 12px; border: 1px solid orange; border-radius: 4px;">🚀 ĐIỀU CHỈNH TARGET (BOOST)</div>
                    <div style="display: flex; justify-content: space-around; align-items: center; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 11px; font-weight: 900;">🎯Doanh Thu:</span>
                            <input type="number" id="boostDT" step="0.1" style="width: 50px; padding: 5px; border: 2px solid #000; border-radius: 4px; font-weight: 900; text-align: center;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 11px; font-weight: 900;">📦Nhóm hàng:</span>
                            <input type="number" id="boostNH" step="0.1" style="width: 50px; padding: 5px; border: 2px solid #000; border-radius: 4px; font-weight: 900; text-align: center;">
                        </div>
                    </div>
                </div>
                <div style="border: 2px solid #eee; border-radius: 8px; padding: 15px 10px 10px 10px; margin-bottom: 20px; position: relative; background: #fafafa;">
                    <div style="font-size: 11px; font-weight: 900; color: #004a99; background: #fff; padding: 0 8px; position: absolute; top: -12px; left: 12px; border: 1px solid #eee; border-radius: 4px;">📊 CỘT HIỂN THỊ</div>
                    <div style="display: flex; justify-content: space-around;">
                        <label><input type="checkbox" id="showDT" checked> DT</label>
                        <label><input type="checkbox" id="showBK" checked> BK</label>
                        <label><input type="checkbox" id="showTG" checked> TG</label>
                        <label><input type="checkbox" id="showBTM" checked> BTM</label>
                    </div>
                </div>
                <span style="font-size:13px; font-weight:900; color:#004a99;">📦 NHÓM HÀNG (Kèm Sticker)</span>
                <div style="max-height: 180px; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 10px; padding: 5px;" id="skst_groupChecklist"></div>
                <span style="font-size:13px; font-weight:900; color:#004a99;">👤 ĐỔI TÊN ĐỊNH DANH</span>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 10px;">
                    <table style="width:100%"><tbody id="staffList"></tbody></table>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button onclick="window.skst_saveSettings()" style="padding:10px; background:#28a745; color:#fff; border:none; border-radius:6px; font-weight:900; cursor:pointer;">LƯU ✅</button>
                    <button onclick="window.skst_closeSettings()" style="padding:10px; background:#6c757d; color:#fff; border:none; border-radius:6px; font-weight:900; cursor:pointer;">ĐÓNG ❌</button>
                </div>
            </div>

            <div id="skst_stickerPopup" class="sticker-popup">
                <div class="sticker-grid" id="skst_stickerGrid"></div>
                <div class="st-close" onclick="document.getElementById('skst_stickerPopup').style.display='none'">ĐÓNG</div>
            </div>

            <div class="overlay" onclick="window.skst_closeDetail()" id="ovDetail"></div>
            <div class="detail-panel" id="dpDetail">
                <div id="captureArea" style="background: white; padding: 15px; border: 3px solid var(--primary); border-radius: 8px;">
                    <h2 id="stName" class="detail-title">CHI TIẾT CHỈ TIÊU</h2>
                    <div id="stHeader" class="detail-subtitle">SỨC KHỎE NGÀY...</div>
                    <div class="grid-info">
                        <div class="info-box"><div class="info-label">DOANH THU</div><div id="box1" class="info-val">0 / 0</div><div id="box1sub" class="info-sub">Dự kiến đạt: 0%</div></div>
                        <div class="info-box"><div class="info-label">CÒN LẠI</div><div id="box2" class="info-val" style="color: #d63031 !important;">0tr</div><div id="box2sub" class="info-sub">Mỗi ngày chạy: 0tr</div></div>
                        <div class="info-box" style="grid-column: span 2;" id="box3"></div>
                    </div>
                    <table class="detail-table"></table>
                </div>
                <div class="btn-group" style="margin-top:10px;">
                    <button class="btn-sk" style="background:#28a745" onclick="window.skst_captureStaffDetail()">CHỤP ẢNH 📷</button>
                    <button class="btn-sk" style="background:#6c757d" onclick="window.skst_closeDetail()">ĐÓNG ❌</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        unsafeWindow.skst_processedData = null;
        unsafeWindow.skst_config = JSON.parse(localStorage.getItem('skst_config_v56')) || { boostDT: 1.0, boostNH: 1.0, showCols: {dt:true, bk:true, tg:true, btm:true}, groups:{}, staffs:{} };

        unsafeWindow.skst_getRemainingDays = () => { const now = new Date(); return (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1) || 1; }
        unsafeWindow.skst_getPassedDays = () => new Date().getDate();
        unsafeWindow.skst_getTotalDays = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        unsafeWindow.skst_getDN = (id, useBigStk = true) => { const item = unsafeWindow.skst_config.groups[id]; const base = id.replace(/Thi đua doanh thu |Thi đua số lượng |Thi đua |Ngành hàng |Nhóm |Số lượng /gi, "").trim(); if (!item) return base; const stk = item.stk || "📦"; const alias = item.alias || base; return useBigStk ? `<span class="stk-display">${stk}</span>${alias}` : alias + stk; };
        unsafeWindow.skst_getShort = (f) => { let p = f.split(" - ")[0].trim().split(" "); return p[p.length-1]; };

        unsafeWindow.skst_getRankColor = (v, a, isNH = false, rev = false) => {
            if (v === 0 && !rev) return "bg-zero";
            if (isNH) { if (v >= 100) return "bg-good"; if (v >= 80) return "bg-mid"; return "bg-bad"; }
            if (!a || a.length < 2) return "";
            const u = [...new Set(a)].sort((x,y) => y-x);
            const idx = u.indexOf(v);
            const r = (rev ? (1 - (idx/(u.length-1||1))) : (idx/(u.length-1||1))) || 0;
            return r <= 0.35 ? "bg-good" : r <= 0.65 ? "bg-mid" : "bg-bad";
        }

        unsafeWindow.skst_openSettings = function() {
            if (!unsafeWindow.skst_processedData) { alert("Vui lòng Xuất Dữ Liệu trước!"); return; }
            let so = document.getElementById('setOverlay'); let sp = document.getElementById('settingsPanel');
            if(so) so.style.display = 'block'; if(sp) sp.style.display = 'block';

            document.getElementById('boostDT').value = unsafeWindow.skst_config.boostDT || 1.0; document.getElementById('boostNH').value = unsafeWindow.skst_config.boostNH || 1.0;
            const sc = unsafeWindow.skst_config.showCols; document.getElementById('showDT').checked = sc.dt; document.getElementById('showBK').checked = sc.bk; document.getElementById('showTG').checked = sc.tg; document.getElementById('showBTM').checked = sc.btm;

            const groupListDiv = document.getElementById('skst_groupChecklist');
            groupListDiv.innerHTML = "";
            Object.keys(unsafeWindow.skst_config.groups).forEach(gn => {
                const conf = unsafeWindow.skst_config.groups[gn];
                groupListDiv.innerHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="skst-sticker-btn" data-id="${gn}">${conf.stk || '📦'}</span>
                            <span style="font-weight:bold; font-size:10px;">${gn.substring(0,25)}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:5px;">
                            <input type="checkbox" class="g-vis-sk" data-id="${gn}" ${conf.show?'checked':''}>
                            <input type="text" class="alias-input" placeholder="Tên ngắn..." value="${conf.alias||''}">
                        </div>
                    </div>`;
            });

            document.getElementById('staffList').innerHTML = Object.keys(unsafeWindow.skst_config.staffs).map(sid => `<tr><td><input type="checkbox" ${unsafeWindow.skst_config.staffs[sid].show?'checked':''} onchange="window.skst_config.staffs['${sid}'].show=this.checked"></td><td style="font-size:10px; text-align:left;">${unsafeWindow.skst_getShort(sid)}</td><td><input type="text" class="alias-input" style="width:100px" value="${unsafeWindow.skst_config.staffs[sid].alias||''}" onchange="window.skst_config.staffs['${sid}'].alias=this.value.toUpperCase()"></td></tr>`).join("");
        }

        unsafeWindow.activePickerBtnSkst = null;
        unsafeWindow.activeGroupIdSkst = "";
        unsafeWindow.skst_showStickerPopup = function(event, btn, id) {
            event.stopPropagation();
            unsafeWindow.activePickerBtnSkst = btn;
            unsafeWindow.activeGroupIdSkst = id;
            document.getElementById('skst_stickerGrid').innerHTML = STICKERS.map(s => `<div class="st-opt" onclick="window.skst_selectSticker('${s}')">${s}</div>`).join('');
            document.getElementById('skst_stickerPopup').style.display = 'flex';
        };

        unsafeWindow.skst_selectSticker = function(st) {
            if(unsafeWindow.activePickerBtnSkst) unsafeWindow.activePickerBtnSkst.innerText = st;
            if(!unsafeWindow.skst_config.groups[unsafeWindow.activeGroupIdSkst]) unsafeWindow.skst_config.groups[unsafeWindow.activeGroupIdSkst] = { show: true, stk: "📦", alias: "" };
            unsafeWindow.skst_config.groups[unsafeWindow.activeGroupIdSkst].stk = st;
            document.getElementById('skst_stickerPopup').style.display = 'none';
        };

        unsafeWindow.skst_saveSettings = function() {
            unsafeWindow.skst_config.boostDT = parseFloat(document.getElementById('boostDT').value) || 1.0; unsafeWindow.skst_config.boostNH = parseFloat(document.getElementById('boostNH').value) || 1.0;
            unsafeWindow.skst_config.showCols.dt = document.getElementById('showDT').checked; unsafeWindow.skst_config.showCols.bk = document.getElementById('showBK').checked; unsafeWindow.skst_config.showCols.tg = document.getElementById('showTG').checked; unsafeWindow.skst_config.showCols.btm = document.getElementById('showBTM').checked;

            document.querySelectorAll('#skst_groupChecklist > div').forEach(div => {
                const id = div.querySelector('.skst-sticker-btn').getAttribute('data-id');
                const stk = div.querySelector('.skst-sticker-btn').innerText;
                const show = div.querySelector('.g-vis-sk').checked;
                const alias = div.querySelector('.alias-input').value.trim().toUpperCase();
                unsafeWindow.skst_config.groups[id] = { show: show, stk: stk, alias: alias };
            });

            localStorage.setItem('skst_config_v56', JSON.stringify(unsafeWindow.skst_config));
            unsafeWindow.skst_closeSettings(); unsafeWindow.skst_masterProcess();
        }

        unsafeWindow.skst_closeSettings = () => {
            const sp = document.getElementById('settingsPanel');
            const so = document.getElementById('setOverlay');
            if (sp) sp.style.display = 'none';
            if (so) so.style.display = 'none';
        }

        unsafeWindow.skst_closeDetail = () => {
            let dp = document.getElementById('dpDetail'); let ov = document.getElementById('ovDetail');
            if(dp) dp.style.display = 'none'; if(ov) ov.style.display = 'none';
        }

        unsafeWindow.skst_toggleReward = () => { const rw = document.getElementById('rewardOutput'); rw.style.setProperty('display', rw.style.display === 'none' ? 'block' : 'none', 'important'); }

        unsafeWindow.skst_showStaffDetail = function(sid) {
            if(!unsafeWindow.skst_processedData) return;
            const { storeInfo, sData, gNames } = unsafeWindow.skst_processedData;
            
            // ĐÃ KHẮC PHỤC TRIỆT ĐỂ LỖI LOGIC NÀY
            const s = sData.find(x => x.id === sid);
            
            if (!s) {
                console.error("Không tìm thấy dữ liệu định danh:", sid);
                return;
            }

            const slnv = sData.filter(x => unsafeWindow.skst_config.staffs[x.id]?.show).length || 1;
            const bDT = parseFloat(unsafeWindow.skst_config.boostDT) || 1.0; const bNH = parseFloat(unsafeWindow.skst_config.boostNH) || 1.0;
            const daysLeft = unsafeWindow.skst_getRemainingDays(), daysPassed = unsafeWindow.skst_getPassedDays(), daysTotal = unsafeWindow.skst_getTotalDays();

            const t_nv_boost = (storeInfo.t_goc * bDT) / slnv; const p_dk_boost = ((s.dt / daysPassed) * daysTotal / t_nv_boost) * 100;
            const conLaiDT = Math.max(0, t_nv_boost - s.dt); const moiNgayDT = conLaiDT / daysLeft;

            document.getElementById('stName').innerText = (unsafeWindow.skst_config.staffs[sid]?.alias || unsafeWindow.skst_getShort(sid)).toUpperCase();
            document.getElementById('stHeader').innerText = `SỨC KHỎE NGÀY ${daysPassed}/${new Date().getMonth()+1}`;

            const boxes = document.querySelectorAll('#dpDetail .grid-info .info-box');
            [0, 1].forEach(i => {
                if(boxes[i]) {
                    boxes[i].style.minHeight = "80px"; boxes[i].style.display = "flex"; boxes[i].style.flexDirection = "column";
                    boxes[i].style.justifyContent = "center"; boxes[i].style.background = "#fff"; boxes[i].style.border = "2px solid #004a99";
                    boxes[i].style.borderRadius = "8px"; boxes[i].style.padding = "5px";
                }
            });

            document.getElementById('box1').innerText = `${lamTronTamHoa(s.dt)} / ${lamTronTamHoa(t_nv_boost)}`; document.getElementById('box1').style.fontSize = "20px";
            document.getElementById('box1sub').innerText = `Dự kiến: ${lamTronTamHoa(p_dk_boost)}%`; document.getElementById('box1sub').style.fontWeight = "900";
            document.getElementById('box2').innerText = `${lamTronTamHoa(conLaiDT)}tr`; document.getElementById('box2').style.fontSize = "20px";
            document.getElementById('box2sub').innerText = `Mỗi ngày: ${moiNgayDT.toFixed(1)}tr`; document.getElementById('box2sub').style.fontWeight = "900";

            let itms = [];
            storeInfo.groups.filter(g => unsafeWindow.skst_config.groups[g.n]?.show).forEach(g => {
                let tb_g_nv = (g.t * bNH) / slnv; let r_g_nv = s.data[gNames.indexOf(g.n)] || 0;
                let pb_g_nv = ((r_g_nv / daysPassed) * daysTotal / tb_g_nv) * 100;
                itms.push({ n: g.n, t: tb_g_nv, r: r_g_nv, p: pb_g_nv });
            });

            const soNhomDat = itms.filter(x => x.p >= 100).length;
            const box3 = document.getElementById('box3');
            if(box3) {
                box3.style.gridColumn = "span 2"; box3.style.minHeight = "85px"; box3.style.display = "flex";
                box3.style.alignItems = "center"; box3.style.background = "#f0f7ff"; box3.style.border = "2px solid #004a99";
                box3.style.borderRadius = "8px"; box3.style.marginTop = "8px";
                box3.innerHTML = `
                    <div style="display: flex; justify-content: space-around; align-items: center; width: 100%; font-weight: 900;">
                        <span style="display: flex; flex-direction: column; align-items: center;"><small style="font-size: 12px; color: #000; font-weight: 900; margin-bottom: 5px;">TRẢ GÓP</small><span style="color: #2e7d32; font-size: 20px;">💰 ${lamTronTamHoa(s.tg)}%</span></span>
                        <span style="display: flex; flex-direction: column; align-items: center;"><small style="font-size: 12px; color: #000; font-weight: 900; margin-bottom: 5px;">BÁN KÈM</small><span style="color: #ed6c02; font-size: 20px;">✨ ${Math.floor(s.bk)}%</span></span>
                        <span style="display: flex; flex-direction: column; align-items: center;"><small style="font-size: 12px; color: #000; font-weight: 900; margin-bottom: 5px;">NHÓM ĐẠT</small><span style="color: #d32f2f; font-size: 20px;">📦 ${soNhomDat}/${itms.length}</span></span>
                    </div>`;
            }

            itms.sort((a,b) => b.p - a.p);
            let tableHtml = `<thead><tr><th>NHÓM HÀNG</th><th>TARGET</th><th>LŨY KẾ</th><th>DỰ KIẾN</th><th>CÒN LẠI</th><th>MỖI NGÀY</th></tr></thead><tbody id="detBody">`;
            let body = '';
            itms.forEach(it => {
                const conG = Math.max(0, it.t - it.r); const moiNgayG = conG / daysLeft;
                const rowClass = it.p >= 100 ? 'bg-good' : (it.p >= 80 ? 'bg-mid' : 'bg-bad');
                body += `<tr class="${rowClass}">
                    <td style="text-align:left; font-size:11px;">${unsafeWindow.skst_getDN(it.n, false)}</td>
                    <td>${lamTronTamHoa(it.t)}</td><td>${lamTronTamHoa(it.r)}</td><td>${lamTronTamHoa(it.p)}%</td>
                    <td style="color:red; font-weight:900;">${lamTronTamHoa(conG)}</td>
                    <td style="background:#fffbe6; color:#000; font-weight:900;">${moiNgayG.toFixed(1)}</td>
                </tr>`;
            });
            document.querySelector('#dpDetail .detail-table').innerHTML = tableHtml + body + `</tbody>`;

            let ovd = document.getElementById('ovDetail'); let dpd = document.getElementById('dpDetail');
            if(ovd) ovd.style.display = 'block';
            if(dpd) dpd.style.display = 'block';
        }

        unsafeWindow.skst_captureStaffDetail = async function() {
            const tenNV = document.getElementById('stName').innerText || "ThongTin";
            const area = document.getElementById('captureArea'); const oldWidth = area.style.width; area.style.width = area.scrollWidth + "px";
            const canvas = await html2canvas(area, { scale: 6, useCORS: true, width: area.scrollWidth, windowWidth: area.scrollWidth, backgroundColor: "#ffffff" });
            area.style.width = oldWidth;
            const link = document.createElement('a'); link.download = `SK_${tenNV}_${new Date().getDate()}-${new Date().getMonth()+1}.png`; link.href = canvas.toDataURL("image/png", 1.0); link.click();
        }

        function getValByGPS(rawData, colIndex) {
            let lines = rawData.split('\n'); let res = [];
            for(let j = 0; j < lines.length; j++) {
                let line = lines[j].trim();
                if (!line || !line.includes("-") || line.includes("Việt Bí")) continue;
                let p = line.split(/\t|\s{2,}/).filter(x => x !== "");
                if(p.length > colIndex) {
                    let cleanVal = p[colIndex].replace(/,/g, '').replace(/tr/gi, '').replace(/%/g, '');
                    res.push({ id: p[0].split('-')[0].trim(), val: parseFloat(cleanVal) || 0 });
                }
            }
            return res;
        }

        unsafeWindow.skst_masterProcess = function() {
            const raw = [1,2,3,4,5].map(n => document.getElementById('i'+n).value.trim());
            if(!raw[0] || !raw[2]) return;
            let storeInfo = { dt:0, t_goc:0, p_goc: 0, tg:"0%", groups:[] };

            const l1 = raw[0].split('\n').map(l => l.trim()).filter(l => l !== "");
            l1.forEach((l, i) => {
                if(l === "DTQĐ") storeInfo.dt = parseFloat(l1[i+1]?.replace(/,/g,'')) || 0;
                if(l === "Target (QĐ)") storeInfo.t_goc = parseFloat(l1[i+1]?.replace(/,/g,'')) || 0;
                if(l === "% HT Target Dự Kiến (QĐ)") storeInfo.p_goc = parseFloat(l1[i+1]?.replace(/%/g,'')) || 0;
                if(l === "Tỷ Trọng Trả Chậm") storeInfo.tg = l1[i+1] || "0%";
                if(l.includes("Thi đua") || l.includes("Ngành hàng")) {
                    let gN = l.replace(/Thi đua doanh thu |Thi đua số lượng |Thi đua |Ngành hàng |Nhóm /gi,"").trim();
                    let tV = 0, rV = 0, pV = 0;
                    for(let j=i+1; j<i+12; j++) {
                        if(!l1[j]) break;
                        if(l1[j] === "Target") tV = parseFloat(l1[j+1]?.replace(/,/g,'')) || 0;
                        if(l1[j] === "DTLK" || l1[j] === "SLLK") rV = parseFloat(l1[j+1]?.replace(/,/g,'')) || 0;
                        if(l1[j].includes("% HT Dự Kiến")) {
                            let pText = l1[j+1] || ""; let nums = pText.match(/\d+(\.\d+)?/g);
                            if (nums && nums.length >= 2) { pV = parseFloat(nums[1]); } else { pV = parseFloat(pText.replace(/%/g,'')) || 0; }
                            break;
                        }
                    }
                    if(tV > 0) storeInfo.groups.push({ n: gN, t: tV, r: rV, p: pV });
                }
            });

            const l3 = raw[2].split('\n').map(l => l.trim());
            let gNames = []; let hIdx = l3.findIndex(l => l.includes("Phòng ban")); let dtlkIdx = l3.findIndex((l, idx) => idx > hIdx && (l.includes("DTLK") || l.includes("SLLK")));
            if(hIdx !== -1 && dtlkIdx !== -1) { for(let j=hIdx+1; j<dtlkIdx; j++) { if(l3[j] !== "") gNames.push(l3[j]); } }

            let sData = [];
            for(let j=dtlkIdx+1; j<l3.length; j++) {
                let l = l3[j];
                if(!l || l.includes("Tổng") || l.includes("BP ")) continue;
                if(l.includes("-")) {
                    let prefix = l.split("-")[0];
                    if (/[a-zA-ZÀ-ỹ]/.test(prefix)) {
                        const excl = ["Thông", "Nhung", "One", "Ca", "Long", "LOADING-", "Việt Bí"];
                        if (!excl.some(a => l.includes(a))) {
                            let parts = l.split(/\t|\s{2,}/).filter(x => x !== "");
                            let s = { id: parts[0].trim(), dt: 0, bk: 0, tg: 0, data: [] };
                            let nums = parts.slice(1).map(x => parseFloat(x.replace(/,/g, '')) || 0);
                            s.data = nums.slice(0, gNames.length).map(v => lamTronTamHoa(v));
                            sData.push(s);
                        }
                    }
                }
            }

            let dtData = getValByGPS(raw[1], 2); dtData.forEach(item => { let s = sData.find(x => x.id.includes(item.id)); if(s) s.dt = item.val; });
            let bkData = getValByGPS(raw[3], 5); bkData.forEach(item => { let s = sData.find(x => x.id.includes(item.id)); if(s) s.bk = item.val; });
            raw[4].split('\n').forEach(l => {
                let p = l.trim().split(/\t|\s{2,}/).filter(x => x !== "");
                if(p[0] && /[a-zA-ZÀ-ỹ]/.test(p[0]) && !p[0].includes("Tổng") && !p[0].includes("Việt Bí")) {
                    let s = sData.find(x => x.id.includes(p[0].split('-')[0].trim()));
                    if(s) s.tg = parseFloat(p[p.length-1].replace(/,/g,'')) || 0;
                }
            });

            let activeG = {}; storeInfo.groups.forEach(g => { activeG[g.n] = unsafeWindow.skst_config.groups[g.n] || { show: true, stk: "📦", alias: "" }; }); unsafeWindow.skst_config.groups = activeG;
            let activeS = {}; sData.forEach(s => { activeS[s.id] = unsafeWindow.skst_config.staffs[s.id] || { show: true, alias: "" }; }); unsafeWindow.skst_config.staffs = activeS;
            localStorage.setItem('skst_config_v56', JSON.stringify(unsafeWindow.skst_config));
            unsafeWindow.skst_processedData = { storeInfo, sData, gNames };
            unsafeWindow.skst_renderAll();
        }

        unsafeWindow.skst_renderAll = function() {
            if(!unsafeWindow.skst_processedData) return;
            const { storeInfo, sData, gNames } = unsafeWindow.skst_processedData;
            const bDT = parseFloat(unsafeWindow.skst_config.boostDT) || 1.0; const bNH = parseFloat(unsafeWindow.skst_config.boostNH) || 1.0;
            storeInfo.t_boost = storeInfo.t_goc * bDT; storeInfo.p_boost = (bDT === 1.0) ? storeInfo.p_goc : ((storeInfo.dt / unsafeWindow.skst_getPassedDays()) * unsafeWindow.skst_getTotalDays() / storeInfo.t_boost) * 100;
            const actG = storeInfo.groups.filter(g => unsafeWindow.skst_config.groups[g.n]?.show).map(g => {
                let tb = g.t * bNH; let pb = (bNH === 1.0) ? g.p : ((g.r / unsafeWindow.skst_getPassedDays()) * unsafeWindow.skst_getTotalDays() / tb) * 100; return { ...g, tb, pb };
            }).sort((a,b) => b.pb - a.pb);

            document.getElementById('skStore').innerHTML = `
                <div class="sk-card"><div class="sk-label" style="font-weight:900;">LŨY KẾ/TARGET</div><div class="sk-value">${lamTronTamHoa(storeInfo.dt)}/${lamTronTamHoa(storeInfo.t_boost)}</div></div>
                <div class="sk-card"><div class="sk-label" style="font-weight:900;">DỰ KIẾN</div><div class="sk-value">${lamTronTamHoa(storeInfo.p_boost)}%</div></div>
                <div class="sk-card"><div class="sk-label" style="color:red; font-weight:900;">CÒN ${unsafeWindow.skst_getRemainingDays()} NGÀY,MỖI NGÀY</div><div class="sk-value" style="color:red;">${lamTronTamHoa(Math.max(0, storeInfo.t_boost-storeInfo.dt)/unsafeWindow.skst_getRemainingDays())}tr</div></div>
                <div class="sk-card"><div class="sk-label" style="font-weight:900;">TRẢ GÓP</div><div class="sk-value">${lamTronTamHoa(parseFloat(storeInfo.tg.replace(/%/g, '')))}%</div></div>
                <div class="sk-card"><div class="sk-label" style="font-weight:900;">NHÓM ĐẠT</div><div class="sk-value">${actG.filter(g => g.pb >= 100).length}/${actG.length}</div></div>`;

            let gh = '', gb = '<tr>';
            actG.forEach(g => { gh += `<th>${unsafeWindow.skst_getDN(g.n)}</th>`; gb += `<td class="${unsafeWindow.skst_getRankColor(g.pb, [], true)}"><span class="main-percent">${lamTronTamHoa(g.pb)}%</span><span class="sub-info">${lamTronTamHoa(g.r)}/${lamTronTamHoa(g.tb)}</span><span class="remain-info">${g.tb-g.r>0?'C:'+lamTronTamHoa(g.tb-g.r):'🏁'}</span></td>`; });
            document.getElementById('gh').innerHTML = gh; document.getElementById('gb').innerHTML = gb + '</tr>';

            const visS = sData.filter(s => unsafeWindow.skst_config.staffs[s.id]?.show); const visG = gNames.filter(gn => actG.some(ag => ag.n === gn));
            let mh = `<th class="sticky-col">TÊN</th>`;
            if(unsafeWindow.skst_config.showCols.dt) mh += `<th class="fixed-col">DT</th>`;
            if(unsafeWindow.skst_config.showCols.bk) mh += `<th class="fixed-col">BK</th>`;
            if(unsafeWindow.skst_config.showCols.tg) mh += `<th class="fixed-col">TG</th>`;
            if(unsafeWindow.skst_config.showCols.btm) mh += `<th class="fixed-col">BTM</th>`;
            visG.forEach(gn => mh += `<th>${unsafeWindow.skst_getDN(gn)}</th>`);
            document.getElementById('mh').innerHTML = mh;

            const gV = visG.map(gn => visS.map(s => s.data[gNames.indexOf(gn)] || 0));
            const allBTM = [];
            visS.forEach(s => { let b = 0; visG.forEach((gn, i) => { if(actG.some(ag => ag.n === gn)) { let v = s.data[gNames.indexOf(gn)] || 0; if(unsafeWindow.skst_getRankColor(v, gV[i]) === "bg-bad" || v === 0) b++; } }); allBTM.push(b); });

            let mb = ''; visS.sort((a,b) => b.dt - a.dt).forEach((s) => {
                let bc = 0; visG.forEach((gn, i) => { if(actG.some(ag => ag.n === gn)) { let v = s.data[gNames.indexOf(gn)] || 0; if(unsafeWindow.skst_getRankColor(v, gV[i]) === "bg-bad" || v === 0) bc++; } });
                let row = `<tr><td class="sticky-col" onclick="window.skst_showStaffDetail('${s.id}')">${unsafeWindow.skst_config.staffs[s.id]?.alias || unsafeWindow.skst_getShort(s.id)}</td>`;
                if(unsafeWindow.skst_config.showCols.dt) row += `<td class="fixed-col ${unsafeWindow.skst_getRankColor(s.dt, visS.map(x=>x.dt))}">${lamTronTamHoa(s.dt)}</td>`;
                if(unsafeWindow.skst_config.showCols.bk) row += `<td class="fixed-col ${unsafeWindow.skst_getRankColor(s.bk, visS.map(x=>x.bk))}">${Math.floor(s.bk)}%</td>`;
                if(unsafeWindow.skst_config.showCols.tg) row += `<td class="fixed-col ${unsafeWindow.skst_getRankColor(s.tg, visS.map(x=>x.tg))}">${lamTronTamHoa(s.tg)}%</td>`;
                if(unsafeWindow.skst_config.showCols.btm) row += `<td class="fixed-col ${unsafeWindow.skst_getRankColor(bc, allBTM, false, true)}">${bc}</td>`;
                visG.forEach((gn, i) => { let val = s.data[gNames.indexOf(gn)] || 0; row += `<td class="${unsafeWindow.skst_getRankColor(val, gV[i])}">${lamTronTamHoa(val)}</td>`; }); mb += row + `</tr>`;
            });
            document.getElementById('mb').innerHTML = mb;
            document.getElementById('skStore').style.display = 'grid'; document.getElementById('skGroups').style.display = 'block'; document.getElementById('reportArea').style.display = 'block';

            let rHtml = `<div class="reward-header">🏆 CHIẾN THẦN NHÓM HÀNG (ĐẠT 100%)</div>`; let hasR = false;
            actG.filter(g => g.pb >= 100).forEach(g => {
                let maxV = -1, win = "";
                visS.forEach(s => {
                    let v = s.data[gNames.indexOf(g.n)] || 0;
                    if(v > maxV) { maxV = v; win = (unsafeWindow.skst_config.staffs[s.id]?.alias || unsafeWindow.skst_getShort(s.id)).toUpperCase(); }
                    else if(v === maxV && v > 0) { win += " & " + (unsafeWindow.skst_config.staffs[s.id]?.alias || unsafeWindow.skst_getShort(s.id)).toUpperCase(); }
                });
                if(maxV > 0) { hasR = true; rHtml += `<div class="reward-row"><span>🎯 ${unsafeWindow.skst_getDN(g.n, false)}</span><span>🥇 <span class="reward-name">${win}</span>: <span class="reward-value">${lamTronTamHoa(maxV)}</span></span></div>`; }
            });
            document.getElementById('rewardOutput').innerHTML = hasR ? rHtml : `<div style="padding:15px; text-align:center; font-weight:900; color:#666;">Chưa nhóm nào đạt 100%.</div>`;
        }

        unsafeWindow.skst_captureReport = async function() {
            const area = document.getElementById('screenshotArea'); const oldW = area.style.width; area.style.width = area.scrollWidth + "px";
            const canvas = await html2canvas(area, { scale: 6, useCORS: true, backgroundColor: "#ffffff" });
            area.style.width = oldW;
            const link = document.createElement('a'); link.download = `SKNV_${new Date().getDate()}-${new Date().getMonth()+1}.png`; link.href = canvas.toDataURL(); link.click();
        }

        unsafeWindow.skst_generateFullReport = function() {
            if (!unsafeWindow.skst_processedData) return;
            const { storeInfo, sData, gNames } = unsafeWindow.skst_processedData; const days = unsafeWindow.skst_getRemainingDays(); const bNH = parseFloat(unsafeWindow.skst_config.boostNH) || 1.0;
            const toStkNum = (n) => String(Math.round(n)).split('').map(d => ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][parseInt(d)] || d).join('');
            const cleanStk = (str) => str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim(); const medals = ["🥇", "🥈", "🥉"];

            let actG = storeInfo.groups.filter(g => unsafeWindow.skst_config.groups[g.n]?.show).map(g => { let tb = g.t * bNH; let pb = (bNH === 1.0) ? g.p : ((g.r / unsafeWindow.skst_getPassedDays()) * unsafeWindow.skst_getTotalDays() / tb) * 100; return { ...g, tb, pb }; });
            const fmtG = (list) => list.map(g => { const item = unsafeWindow.skst_config.groups[g.n]; const stk = item.stk || "📦"; const name = item.alias || g.n.replace(/Thi đua doanh thu |Thi đua số lượng |Thi đua |Ngành hàng |Nhóm |Số lượng /gi, "").trim(); return `${stk}${cleanStk(name)} ${lamTronTamHoa(g.pb)}%`; }).join(", ");

            let hoanThanh = fmtG(actG.filter(g => g.pb >= 100)); let ganDat = fmtG(actG.filter(g => g.pb >= 80 && g.pb < 100)); let canhBaoG = fmtG(actG.filter(g => g.pb < 80));
            const visS = sData.filter(s => unsafeWindow.skst_config.staffs[s.id]?.show); const visG = gNames.filter(gn => actG.some(ag => ag.n === gn)); const gV = visG.map(gn => visS.map(s => s.data[gNames.indexOf(gn)] || 0));

            let st = visS.map(s => { let btm = 0; visG.forEach((gn, i) => { if(actG.some(ag => ag.n === gn)) { let v = s.data[gNames.indexOf(gn)] || 0; if (unsafeWindow.skst_getRankColor(v, gV[i]) === "bg-bad" || v === 0) btm++; } }); return { name: unsafeWindow.skst_config.staffs[s.id]?.alias || unsafeWindow.skst_getShort(s.id), dt: s.dt, bk: s.bk, tg: s.tg, btm: btm }; });

            const getTop = (arr, key, n=3, rev=false) => [...arr].sort((a,b) => rev ? a[key]-b[key] : b[key]-a[key]).slice(0, n);
            const dtHienTai = storeInfo.dt; const targetMoi = storeInfo.t_boost; const phanTramMoi = storeInfo.p_boost; const canBucPha = Math.max(0, (targetMoi - dtHienTai) / days);

            let tgNum = parseFloat(storeInfo.tg.replace(/%/g, ''));
            let r = `🚀 SỨC KHỎE ST ĐẾN NGÀY ${toStkNum(new Date().getDate())}/${toStkNum(new Date().getMonth()+1)} 🚀\n🏥 1. TÌNH HÌNH CHUNG\n🔥 Doanh thu: ${toStkNum(dtHienTai)}/${toStkNum(targetMoi)} đạt ${lamTronTamHoa(phanTramMoi)}%\n⚡ Nhắc nhở: Còn ${toStkNum(days)} ngày, cần bứt phá ${lamTronTamHoa(canBucPha)}tr/ngày để về đích nhé team! 🏁\n💸 Góp ST: ${toStkNum(lamTronTamHoa(tgNum))}%\n📦 Nhóm hàng đạt/Tổng nhóm: ${toStkNum(actG.filter(g => g.pb >= 100).length)}/${toStkNum(actG.length)}\n`;
            if(hoanThanh) r += `✅ Hoàn thành: ${hoanThanh}. Duy trì phong độ nhé!\n`;
            if(ganDat) r += `🎯 Gần đạt: ${ganDat}. Cố gắng thêm chút nữa là xong!\n`;
            if(canhBaoG) r += `🛑 Cần tập trung: ${canhBaoG}. Nỗ lực đẩy mạnh phần này nha anh em!\n\n`;

            r += `👤 2. TÌNH HÌNH CÁ NHÂN\n💰 Doanh thu:\n` + getTop(st, 'dt').map((s,i) => `${medals[i]} ${s.name}: ${lamTronTamHoa(s.dt)}tr`).join("\n") + "\n🏃 Nỗ lực tăng tốc: " + getTop(st, 'dt', 3, true).map(s => `${s.name}`).join(", ") + " Push số gấp nhé!\n\n";
            r += `✨ Bán kèm (BK):\n` + getTop(st, 'bk').map((s,i) => `${medals[i]} ${s.name}: ${Math.floor(s.bk)}%`).join("\n") + "\n🛡️ Cần cải thiện: " + st.filter(s => s.bk < 10).sort((a,b)=>a.bk-b.bk).map(s => `${s.name}`).join(", ") + " tập trung bán kèm !\n\n";
            r += `💸 Trả góp (TG):\n` + getTop(st, 'tg').map((s,i) => `${medals[i]} Top ${i+1}: ${s.name} ${lamTronTamHoa(s.tg)}%`).join("\n") + "\n📉 Cần lưu ý: " + getTop(st, 'tg', 3, true).map(s => `${s.name} ${lamTronTamHoa(s.tg)}%`).join(", ") + " chú ý hành động cải thiện.\n\n";
            r += `🎯 Nhóm hàng:\n🏅 Ghi Nhận: ` + [...st].sort((a,b) => a.btm - b.btm).slice(0,3).map(s => `${s.name}`).join(", ") + " rất tốt!\n💥 Nhắc nhở: " + getTop(st, 'btm', 3).map(s => `${s.name}`).join(", ") + " nắm thông tin cải thiện số sớm nha.\n\n🌈 Chào ngày mới rực rỡ, tư vấn mỏi tay chốt đơn liên tục nhé! 🔥🚀✨";

            const out = document.getElementById('reportOutput'); out.innerText = r; out.style.display = 'block';
            const temp = document.createElement('textarea'); temp.value = r; document.body.appendChild(temp); temp.select();
            try { document.execCommand('copy'); alert("Đã Copy Báo Cáo Nhận Xét ✅"); } catch (err) { alert("Lỗi Copy!"); }
            document.body.removeChild(temp);
        }
    }

    // =========================================================================
    // KHỞI ĐỘNG HỆ THỐNG CỐT LÕI
    // =========================================================================
    boNaoKiemTraTrangThai();

})();
