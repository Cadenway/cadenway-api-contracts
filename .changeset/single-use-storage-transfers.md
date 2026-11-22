---
'@cadenway/contracts': minor
'@cadenway/api-client': patch
---

Document single-use multipart upload tickets for task attachments, intake files and profile images.
The reservation response keeps the existing POST method, URL, form fields and expiry. The Storage
transfer operation consumes a ticket before writing its temporary object.
