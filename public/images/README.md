# โฟลเดอร์เก็บรูปภาพ (public/images)

วางไฟล์รูปภาพที่ต้องการให้เข้าถึงแบบสาธารณะที่นี่ เช่น:
- public/images/product-1.jpg
- public/images/banner.jpg

วิธีใช้งานบนหน้าเว็บ (Vite / React):
- อ้างอิงโดยตรงผ่าน URL สาธารณะ: `<img src="/images/product-1.jpg" alt="...">`
- หลีกเลี่ยงการ import จากโฟลเดอร์ public — ใช้เส้นทางเริ่มต้นด้วย `/images/...`

หมายเหตุ:
- ถ้าต้องการนำรูปมาใช้เป็นส่วนของ component และ bundle เข้ากับโค้ด ให้ย้ายรูปไปที่ `src/assets/images` แล้วใช้ `import`.
- หากต้องการให้ผมเพิ่มตัวอย่างการแสดงรูปในหน้า Home.jsx บอกได้เลย
