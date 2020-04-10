exports.config = {
    update_delay: 900000, //Buat cek data baru, dalam ms (milisecond)
    caption_time_format: 'DD MMMM YY HH.mm', //Format waktu untuk caption, Dokumentasi https://momentjs.com/docs/#/displaying/
    caption_date_format: 'DD MMMM YY', //Format tanggal untuk caption, Dokumentasi https://momentjs.com/docs/#/displaying/
    instagram: {
        username: '',
        password: '',
        caption: {
            // Query tersedia: -time (waktu update)
            //                 -total (total kematian)
            //                 -new (kasus kematian baru)
            //                 -date (tanggal update)
            deaths: `Rest in peace our brother.

Diperbarui pada [time] data dari sumber yang terpercaya
Total Kasus Kematian: [total] ([new])

#LawanCovid19 #COVID19 #COVID19Indonesia`,
            // Query tersedia: -time (waktu update)
            //                 -recovered (total sembuh covid19)
            //                 -date (tanggal update)
            recovered: `Pesan untuk teman-teman yang sudah sembuh: tetap #DiRumahAja & Stay Safe ya !!⁣
⁣
Diperbarui pada [time] data dari sumber yang terpercaya⁣
Total Sembuh: [recovered]
⁣
#LawanCovid19 #COVID19 #COVID19Indonesia`,
            // Query tersedia: -time (waktu update)
            //                 -total (total kasus covid19)
            //                 -new (kasus covid19 baru)
            //                 -date (tanggal update)
            cases: `Never give up!! bersama kita #LawanCovid19

Diperbarui pada [time] data dari sumber yang terpercaya
Total Kasus Positif: [total] ([new])

#LawanCovid19 #COVID19 #COVID19Indonesia`
        }
    },
    font: {
        path: './assets/fonts/Programme-Regular.ttf', //Font untuk text di gambar
        family: 'Programme Regular'
    },
    images: {
        deaths: {
            path: './assets/images/ig-has-fallen.png' //Template gambar buat data kematian
        },
        recovered: {
            path: './assets/images/ig-recovered.png' //Template gambar buat data sembuh
        },
        cases: {
            path: './assets/images/ig-total-case.png' //Template gambar buat data kasus
        }
    },
    timezone: 'Asia/Jakarta' //Timezone buat waktu yg ada di gambar maupun di caption
}