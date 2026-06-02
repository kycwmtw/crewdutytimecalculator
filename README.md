# CI Assistance

櫃台與航務作業用的靜態網頁工具包。  
本專案以瀏覽器直接開啟 HTML 使用為主，沒有後端服務、沒有打包流程，也沒有 `package.json`。各工具多以內嵌 JavaScript 實作，部分頁面會引用 CDN 版 Tailwind CSS、SheetJS 與 Google Fonts。

## 專案定位

這個資料夾整理了多個日常作業小工具，主要協助處理：

- FDP 底線、中斷工時與延長工時計算
- 改時通知與 FDP limit 電報產生
- ASM / MVT / WebJC 資料整理
- 值班航班清單、跨日航班檢查
- 值班班表申報資料整理

入口頁為 `index.html`，可從首頁進入各功能。

## 使用方式

直接以瀏覽器開啟：

```text
index.html
```

或直接開啟任一工具頁，例如：

```text
calculators.html
retime.html
kuatian.html
flight_gd_shift_tool.html
duty_claims.html
telex.html
```

注意：部分功能需要讀取 Excel，瀏覽器需能載入外部 CDN 的 SheetJS；部分頁面使用 Tailwind CDN 與 Google Fonts，若離線使用，樣式或 Excel 解析功能可能受影響。

## 工具清單

### `index.html` - 櫃台上班小幫手

專案首頁與功能選單。

功能：

- 顯示各工具入口
- 顯示 UTC 與台北即時時間
- 將工具分成工時計算、航務通知、值班整理等區塊

### `calculators.html` - 工時計算工具

整合三個工時計算子工具。

#### FDP 底線

用途：輸入 FDP 起算時間、組員派遣模式、航班類型等資料後，計算最晚 Block In。

主要功能：

- 計算 FDP limit
- 依航班主檔自動帶入航段
- 依起飛地當地 ETD 自動判斷日航 / 夜航
- 依機尾號判斷機型、有無 bunk 與最大飛時
- 產生 TPEJC D/O 用電報

FDP 規則：

| 派遣模式 | 日航 | 夜航 |
| --- | ---: | ---: |
| 標準組員（2 人派） | 14 小時 | 12 小時 |
| 加強組員（3 人派） | 18 小時 | 16 小時 |
| 雙組組員（4 人派） | 24 小時 | 22 小時 |

#### 中斷工時計算（ASBY）

用途：適用航機後推前送飯店的情境。

主要功能：

- 輸入 FDP Start、飯店 Check-in / Check-out
- 判斷房內休息時間是否達 3 小時 1 分
- 符合條件時，將休息時間自 FDP 全額扣除
- 產生新的 FDP 底線
- 產生 TPEJC D/O 用電報

#### 延長工時計算

用途：適用航機後推後送飯店的情境。

主要功能：

- 輸入 FDP Start、飯店 Check-in / Check-out、NEW ETD
- 判斷休息時間是否達 3 小時
- 符合條件時，以休息時間的一半延長 FDP
- 依 NEW ETD 重新判斷日航 / 夜航
- 檢查是否超過連續 24 小時上限
- 產生新的 FDP 底線與電報

目前頁面標示「測試中！請慎用！」，實務使用前請再次人工確認。

### `retime.html` - 改時通知產生器

用途：快速產生給組員看的改時通知。

支援兩種模式：

- 貼上 ASM 或 MVT 改時電報，自動解析航班、日期與新 ETD
- 手動輸入航班號、航班日期與 NEW ETD

主要功能：

- 將電報內 UTC 時間換算為台北 Local time
- 計算 BOT Reporting Time
- BOT Reporting Time = NEW ETD - 90 分鐘
- 產生可直接複製的組員通知文字

輸出格式大致如下：

```text
*** Schedule Change Information ***
CIxxxx/DDMON  **RE-TIME** NOTICE

NEW ETD: xxxxL/DDMON
BOT Reporting Time: xxxxL/DDMON

Please ack on eCrew, thanks!

TPEOS
```

### `kuatian.html` - 航班跨日檢查工具

用途：檢查 WebJC 匯出的 Excel 中，指定貨機航班是否發生跨日。

使用流程：

1. 至 WebJC 查詢航班資料
2. TIME_TYPE 選 LOCAL
3. 匯出 Excel
4. 將 Excel 上傳至本工具
5. 選擇上班日期
6. 工具會檢查該日 07:00L 到隔天 07:00L 的航班

篩選條件：

- 指定航司營運
- TPE 起訖
- 機型碼 74Y / 77X

判斷邏輯：

- TPE 出發：比對 STD 與 ETD / ATD 日期
- TPE 到達：比對 STA 與 ETA / ATA 日期
- 若表定日期與預估或實際日期不同，列為跨日

輸出格式：

```text
CIXXXX/DDMMM/DEP-ARV STD或STA DDHHMM(L) ETD或ETA或ATD或ATA DDHHMM(L)
```

工具提供複製結果與下載 TXT。

### `flight_gd_shift_tool.html` - 值班航班整理工具

用途：將 WebJC 匯出的航班 Excel 依值班班別整理成航班清單。

支援班別：

| 班別 | 時間 |
| --- | --- |
| A | 07:00-17:00 |
| M | 12:30-22:30 |
| M* | 10:00-20:00 |
| N | 21:00-07:00+1 |
| B | 22:00-08:00+1 |

篩選邏輯：

- 僅處理 CI / AE 航班
- 僅處理 TPE / TSA 出發航班
- 只要松訓報到時間或 BOT 報到時間任一落在值班區間內，即列入清單
- 會額外補上排序中的交接下一班

時間計算：

- 松訓報到時間 = ETD - 140 分鐘
- BOT 報到時間 = ETD - 90 分鐘

額外功能：

- 產生可列印值班航班表
- A 班會整理當天澳紐出發航班
- N / B 班會整理當天台北往澳紐航班

### `telex.html` - 航班改時電報整理工具

用途：整理 ASM 改時電報，將多筆 TIM OPER 資料轉為表格。

主要功能：

- 貼上 ASM 電報內容
- 解析航班號、航班日期、航段、出發時間、抵達時間
- 去除重複資料
- 依可能的 operation 關係分組
- 依航段接續與時間排序
- 顯示航班數、分組數、警告數
- 可標記資料為已處理
- 可複製 TSV 或匯出 CSV

這個工具適合用來把雜亂電報整理成可追蹤、可查核的清單。

### `duty_claims.html` - 值班申報整理工具

用途：上傳當月值班班表後，依同仁整理申報資料。

支援資料：

- 夜間加成
- 夜點費
- 交通費

主要規則：

- 夜間加成代碼為 3
- M / M-：夜間加成 0.5 小時、夜點費 70 元、交通費 240 元
- N / B：夜間加成 8 小時、夜點費 110 元
- 目前交通費簡化規則只列入 M / M-
- R、Z、AL、SL、FL、補2、補6 等休假代碼不列入申報
- 月初斜線班與月底 N- / B- 會依當月實際班別處理

輸出內容：

- 夜間加成 TSV
- 夜點費文字
- 交通費文字
- 全部合併內容
- 每日預覽
- 忽略項目摘要

## 共用資料檔

### `ci_flight_master_feb2026.js`

航班主檔。  
依航班號記錄航段、出發站、抵達站、時區與觀測數。

用途：

- 自動帶出航段
- 協助判斷起飛地時區
- 協助工時計算工具推算 ETD local time

### `airport_timezones_from_ci_feb2026.js`

機場 IATA code 對應 IANA time zone 的資料表。

用途：

- 將 UTC / Zulu 時間換算成起飛地 local time
- 協助判斷日航 / 夜航

### `ci_aircraft_master_v2.js`

機隊資料表。  
依機尾號記錄機型、fleet code、有無 bunk。

Bunk 規則：

- A321 / A330 / B737：無 bunk
- A350 / B777 / B747：有 bunk

最大飛時規則：

| 組員數 | 有 bunk | 無 bunk |
| ---: | ---: | ---: |
| 2 | 10 小時 | 10 小時 |
| 3 | 16 小時 | 12 小時 |
| 4 | 18 小時 | 12 小時 |

### `motion-system.js` / `motion-system.css`

介面動效系統，定義卡片 reveal、hover、計數器、拖放區與成功狀態等視覺效果。

目前各 HTML 尚未引用這兩個檔案，因此現階段不會實際套用。

## 外部依賴

本專案沒有 npm 依賴，但部分頁面會由 CDN 載入：

- Tailwind CSS CDN
- Google Fonts：Noto Sans TC
- SheetJS：用於讀取 `.xls` / `.xlsx`

若部署在無網路或內網環境，建議改為本地化這些 CDN 檔案。

## 注意事項

- 所有計算結果與電報內容送出前仍需人工確認。
- `calculators.html` 的延長工時計算仍標示測試中，請謹慎使用。
- 航班主檔檔名含 `feb2026`，表示資料可能有時效性；若航班計畫更新，需同步更新主檔。
- Excel 工具依 WebJC 匯出欄位名稱解析，若 WebJC 欄位名稱或格式改變，可能需要調整程式。
- 本專案目前沒有自動測試，修改規則後建議用實際案例逐頁驗證。
