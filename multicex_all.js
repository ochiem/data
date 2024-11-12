$(document).ready(function () {
    // Membentuk prefix berdasarkan DTChain.Nama_Chain
    const storagePrefix = "MULTICEX_"+DTChain.Nama_Chain.toUpperCase()+"_"; 
    console.warn("LOCALSTORAGE PREFIX : "+storagePrefix);
    // Fungsi umum untuk mendapatkan data dari localStorage
    function getFromLocalStorage(key, defaultValue) {
        return JSON.parse(localStorage.getItem(storagePrefix + key)) || defaultValue;
    }

    // Fungsi umum untuk menyimpan data ke localStorage
    function saveToLocalStorage(key, value) {
        localStorage.setItem(storagePrefix + key, JSON.stringify(value));
    }

    // Fungsi untuk menghapus item dari localStorage
    function removeFromLocalStorage(key) {
        localStorage.removeItem(storagePrefix + key);
    }

    UIkit.util.on('#modal-setting', 'show', function () {
        form_on();
    });
    
    var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
    var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
    var SavedDataID = getFromLocalStorage('ID','');
    var ListToken = getFromLocalStorage('LIST_TOKEN', {});
    // Daftar input modal yang akan diatur
    const modalInputs = [
        'ModalKiri1INCH', 
        'ModalKiriKYBERSWAP', 
        'ModalKanan1INCH', 
        'ModalKananKYBERSWAP', 
        'ModalKiriODOS', 
        'ModalKiriPARASWAP',
        'ModalKananODOS', 
        'ModalKananPARASWAP', 
        'ModalKiri0X', 
        'ModalKanan0X'
    ];

    var groupSize = SavedSettingData.KoinGroup; 
    var interval = SavedSettingData.jedaTimeGroup; 
    var intervalKoin = SavedSettingData.jedaKoin; 
    var autorun = false;
    var user = getFromLocalStorage('user', null);
    // Muat pilihan CEX dan DEX pair yang tersimpan
    var selectedCEX = getFromLocalStorage("PILIH_CEX", []);
    var selectedDexPair = getFromLocalStorage("PILIH_DEX_PAIR", []);
    var selectedDEX = getFromLocalStorage("PILIH_DEX", []);

    cekDataAwal();
    setNullInfo();
    createRadioButtons(); 
    loadSelectedOptions();
    updateTableVisibility();

    $('title').text("MULTICEX "+DTChain.Nama_Chain.toUpperCase());
    $('#namachain').text(DTChain.Nama_Chain.toUpperCase());
    $('#waktu').text("GRUP :"+interval +" | KOIN :" + intervalKoin);
    $('#lastUpdateTime').text(getFromLocalStorage("LASTUPDATE_FEEWD", "???"));
    $('#dynamicLink').attr('href', `MasterCRUDS.html?chain=${DTChain.Nama_Chain}`);

    if (!user) {
           user = ""; // fallback jika tidak ada nilai
        } 
    
   
    // Fungsi CekIdentitas untuk mendapatkan ID perangkat
    async function CekIdentitas() {
        try {
            let deviceID = generateDeviceID();
            let response = await fetch('https://api4.my-ip.io/v2/ip.json');
            let data = await response.json();

            let simplifiedIdentitas = {
                id: deviceID,
                name: data.asn.name,
                ip: data.ip
            };

            saveToLocalStorage('ID', simplifiedIdentitas);
            let savedID = getFromLocalStorage('ID', {});
            $("#ip").text(`IP: ${savedID.ip}`);
            toastr.success(`ANDA MENDAPATKAN IP: ${savedID.ip}`);
        } catch (error) {
            toastr.error("GAGAL CEK IP!!");
        }
    }

    // Fungsi generateDeviceID
    function generateDeviceID() {
        let userAgent = navigator.userAgent;
        let screenResolution = `${window.screen.width}x${window.screen.height}`;
        let timezoneOffset = new Date().getTimezoneOffset();
        let language = navigator.language;

        return hashCode(`${userAgent}${screenResolution}${timezoneOffset}${language}`);
    }

    // Fungsi untuk menghasilkan hashCode
    function hashCode(str) {
        return str.split("").reduce((hash, char) => {
            hash = ((hash << 5) - hash) + char.charCodeAt(0);
            return hash & hash;
        }, 0);
    }
    const waitTimeMap = {
        '3': "FAST",
        '4': "MEDIUM",
        '5': "NORMAL"
    };

    $('#Lwaktu-tunggu').text(waitTimeMap[SavedSettingData.waktuTunggu] || "");

    function setNullInfo() {
        const defaultSignalKeys = [
            'Kiri1INCHSinyal', 'Kanan1INCHSinyal',
            'KiriODOSSinyal', 'KananODOSSinyal',
            'Kiri0XSinyal', 'Kanan0XSinyal',
            'KiriPARASWAPSinyal', 'KananPARASWAPSinyal',
            'KiriKYBERSWAPSinyal', 'KananKYBERSWAPSinyal'
        ];

        defaultSignalKeys.forEach(key => {
            saveToLocalStorage(key, 0);
            $(`#l${key}`).text("");
        });

        $("#sinyal1inch").text("");
        $("#sinyalodos").text("");
        $("#sinyal0x").text("");
        $("#sinyalparaswap").text("");
        $("#sinyalkyberswap").text("");
    }
     
    // Fungsi untuk menonaktifkan semua input di dalam form
    function form_off() {
        $('input, select, button').prop('disabled', true);
    }

    // Fungsi untuk mengaktifkan semua input di dalam form
    function form_on() {
        $('input, select, button').prop('disabled', false);
    }

    function cekDataAwal() {
        // Array untuk menyimpan pesan error
        let errorMessages = [];
        // Reset semua gambar dan teks ke ukuran normal sebelum pengecekan
        $("#syncDATA, #set-modal, #cek_wallet").removeClass("img-large");
        $("#cek").removeClass("text-large");
        $("#server, #cex, #dex, #dexpair").removeClass("bg-error text-large");
        
        const serverCORS = getFromLocalStorage('DATA_SERVERCORS', null);
        const savedSettingData = getFromLocalStorage('DATA_SETTING', '');
        
        // Verifikasi awal untuk memastikan DATA_SETTING sudah di-sync
        if (!savedSettingData) {
            errorMessages.push('<b>SILAKAN SYNC ULANG DAHULU !!</b><br/>');
            $("#syncDATA").addClass("img-large");
            form_off(); // nonaktifkan form jika belum di-sync
        } else {
            // Cek `DATA_MODAL` dan `LASTUPDATE_FEEWD`
            coinTrueStatus();
            const dataModal = getFromLocalStorage('DATA_MODAL', null);
            const lastUpdateFeeWD = getFromLocalStorage('LASTUPDATE_FEEWD', null);


            if (!dataModal || savedSettingData.walletMETA === '-' ) {
                errorMessages.push('CEK, SETTINGAN APLIKASI {MODAL,WALLET METAMASK}!');
                $("#set-modal").addClass("img-large");
                form_off();
            }
            
            if (!lastUpdateFeeWD) {
                errorMessages.push('UPDATE WALLET DAHULU!');
                $("#cek_wallet").addClass("img-large");
                form_off();
            }
            
            // Lanjutkan validasi hanya jika `DATA_MODAL` dan `LASTUPDATE_FEEWD` sudah terpenuhi
            if (dataModal && lastUpdateFeeWD) {
                // Pengecekan `serverCORS`, `PILIH_CEX`, dan `PILIH_DEX_PAIR`
                if (!serverCORS || typeof serverCORS !== 'string' || serverCORS.trim() === '') {
                    errorMessages.push('SILAKAN, PILIH SERVER DAHULU!!');
                    $("span#server").addClass("bg-error text-large");
                    form_on(); // tetap off jika `serverCORS` belum diatur
                } else {
                    const pilihCex = getFromLocalStorage('PILIH_CEX', null);
                    if (!pilihCex || !Array.isArray(pilihCex) || pilihCex.length === 0) {
                        errorMessages.push('SILAKAN PILIH CEX!');
                        $("span#cex").addClass("bg-error text-large");
                        form_on(); // tetap off jika `PILIH_CEX` belum diatur
                    }
                    
                    const pilihDex = getFromLocalStorage('PILIH_DEX', null);
                    if (!pilihDex || !Array.isArray(pilihDex) || pilihDex.length === 0) {
                        errorMessages.push('SILAKAN PILIH DEX!');
                        $("span#dex").addClass("bg-error text-large");
                        form_on(); // tetap off jika `PILIH_DEX_PAIR` belum diatur
                    }
                    const pilihDexPair = getFromLocalStorage('PILIH_DEX_PAIR', null);
                    if (!pilihDexPair || !Array.isArray(pilihDexPair) || pilihDexPair.length === 0) {
                        errorMessages.push('SILAKAN PILIH PAIR!');
                        $("span#dexpair").addClass("bg-error text-large");
                        form_on(); // tetap off jika `PILIH_DEX_PAIR` belum diatur
                    }
                }
            }
        }
        
        // Tampilkan semua pesan error
        $("#cek").html(errorMessages.join('<br/>')).addClass("text-large");    
    }

    // Fungsi untuk menghitung status koin yang benar
    function coinTrueStatus() {
        var countTrueStatus = 0;
        var coinData = getFromLocalStorage('LIST_TOKEN');
        $.each(coinData, function(index, coin) {
            if (coin.status === true) {
                countTrueStatus++;
            }
        });

        // Menyimpan total koin menggunakan fungsi saveToLocalStorage
        saveToLocalStorage('TotalCoins', countTrueStatus);

        // Mengupdate label dengan jumlah koin
        $("label#JmlKoin").text(getFromLocalStorage('TotalCoins', 0) + "/" + groupSize);

        // Mengupdate elemen dengan simbol pasangan
        $("#pairDex").text(SavedSettingData.symbolPair);    
    }

    $('label#JmlKoin').on('click', dowloadJSON);

    // Fungsi untuk mengunduh data JSON
    function dowloadJSON() {
        var gmbData = getFromLocalStorage('DATA_SETTING', null); // Menggunakan getFromLocalStorage
        if (gmbData) {
            var listToken = { "LIST_TOKEN": ListToken };
            var jsonContent = JSON.stringify(listToken, null, 2);
            var downloadLink = document.createElement('a');
            downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);
            // Menggunakan getFromLocalStorage untuk mendapatkan total koin
            downloadLink.download = getFromLocalStorage('TotalCoins', 0) + "_" + "PAIR.json";
            downloadLink.click();
        } else {
            alert('DATA TOKEN KOSONG');
        }
    }

    // Function to create radio buttons dynamically CORS
    function createRadioButtons() {
        // Add event listener for radio button change
        $('input[name="urlRadio"]').on('change', function () {
            // Store the selected URL in localStorage
            var selectedUrl = $('input[name="urlRadio"]:checked').val();
            saveToLocalStorage('DATA_SERVERCORS', selectedUrl); // Menggunakan saveToLocalStorage
            location.reload();
        });

        // Check the last selected URL if available in localStorage
        var lastSelectedUrl = getFromLocalStorage('DATA_SERVERCORS', null); // Menggunakan getFromLocalStorage
        if (lastSelectedUrl) {
            $('input[name="urlRadio"][value="' + lastSelectedUrl + '"]').prop('checked', true);
        }
    }

    // Memastikan SavedModalData ada dan memuat data
    if (SavedModalData) {
        modalInputs.forEach(input => {
            const value = SavedModalData[input] || '';  // Ambil nilai atau kosongkan
            $('#' + input).val(value);  // Set nilai ke input Modal
            $('#L' + input).val(value); // Set nilai ke input Tabel
        });
    } else {
       toastr.error("ERROR PENGATURAN MODAL!");
    }
    // Fungsi untuk menyimpan data modal
    function updateModal(isFromTable) {
        const modalData = {};
        modalInputs.forEach(input => {
            const selector = isFromTable ? 'L' + input : input;
            modalData[input] = $('#' + selector).val() || '';  // Ambil nilai dari input
        });
        modalData.FilterPNL = $('#inFilterPNL').val() || '';

        // Simpan ke localStorage
        saveToLocalStorage('DATA_MODAL', modalData);
    }
    // SET INFO MODAL
    $(document).on('change', 'input[id^="LModal"]', function() {
        updateModal(true);
        location.reload()
       // toastr.success("MODAL TELAH DIUBAH, JANGAN LUPA REFRESH!!");
    });
    // Jika ada input lain yang mengubah modal
    $(document).on('change', 'input:not([id^="LModal"])', function() {
        updateModal(false);
    });

    // SETTINGAN APLIKASI
    $('#inFilterPNL').val(SavedModalData.FilterPNL || '');
    $('#jeda-time-group').val(SavedSettingData.jedaTimeGroup || '');
    $('#jeda-koin').val(SavedSettingData.jedaKoin || '');
    $('#LKoinGroup').text(SavedSettingData.KoinGroup || '');
    $('#LFilterPNL').text(SavedModalData.FilterPNL || '');
    $('#walletMETA').val(SavedSettingData.walletMETA || '');
    $('#user').val(user || '');

    // Fungsi untuk memeriksa apakah semua input telah terisi
    function checkInput() {
        return $('#modal-setting form input[type="number"], #modal-setting form input[type="text"]').filter(function() {
            return $(this).val() === '';
        }).length === 0;
    }

    // Fungsi untuk mengaktifkan atau menonaktifkan tombol save-button
    function enableSaveButton() {
        $('#save-button').prop('disabled', !checkInput());
    }

    // Jalankan enableSaveButton di awal dan saat inputan berubah
    $('#modal-setting form input').on('input change', enableSaveButton);

    // Panggil fungsi untuk inisialisasi di awal
    enableSaveButton();
    // Event listener for save button click
    $('#save-button').on('click', saveFormDataSetting);

    // fungsi menyimpan data setingan app dan permodalan
    function saveFormDataSetting() {
        var user = $("#user").val();
        saveToLocalStorage("user", user);  // Simpan user menggunakan saveToLocalStorage
    
        // Mengambil data setting yang ada dari localStorage
        var existingSettingData = getFromLocalStorage('DATA_SETTING', {}) || {};
    
        // Update specific arrays in DATA_SETTING
        existingSettingData.LIST_TOKEN = ListToken || [];
        existingSettingData.SERVERCORS = existingSettingData.SERVERCORS || [];
    
        // Mengambil nilai dari form dan memperbarui data setting
        existingSettingData.jedaTimeGroup = $('#jeda-time-group').val();
        existingSettingData.waktuTunggu = $('input[name="waktu-tunggu"]:checked').val();
        existingSettingData.KoinGroup = $('input[name="koin-group"]:checked').val();
        existingSettingData.jedaKoin = $('#jeda-koin').val();
    
        existingSettingData.walletMETA = $('#walletMETA').val();
    
        // Logic untuk memperbarui LIST_TOKEN dan SERVERCORS, Anda dapat menggantinya dengan logika yang tepat
        existingSettingData.LIST_TOKEN = /* your logic to update LIST_TOKEN */
        existingSettingData.SERVERCORS = /* your logic to update SERVERCORS */
    
        // Simpan data setting yang diperbarui ke localStorage menggunakan saveToLocalStorage
        saveToLocalStorage('DATA_SETTING', existingSettingData);
    
        // Memanggil fungsi updateModal
        updateModal();
    
        // Menutup modal setelah menyimpan data
        UIkit.modal("#modal-setting").hide();
    
        alert("SETTING BERHASIL!!");
        location.reload();
    }
    
    function importDataJSON() {
        // Menghapus data yang ada di localStorage dengan key yang sesuai
        removeFromLocalStorage('DATA_SETTING');
        removeFromLocalStorage("LASTUPDATE_FEEWD");
        
        $.ajax({
            url: DTChain.DATAJSON,
            success: function(response) {
                // Memastikan data yang diambil sesuai dengan format yang diharapkan
                if (response && response.serverCORS && response.token && response.telegram) {
                    const serverCORS = response.serverCORS;
                    const token = response.token;
                    const tele_token = response.telegram.token;
                    const id_grup = response.telegram.id_grup;
    
                    // Struktur data untuk disimpan ke localStorage
                    const DataJSON = {
                        TOKEN: tele_token,
                        ID_GRUP: id_grup,
                        SERVERCORS: serverCORS,
                        jedaKoin: 400,
                        jedaTimeGroup: 900,
                        KoinGroup: 4,
                        waktuTunggu: 5,
                        FilterPNL: 0,
                        walletMETA:"-"
                    };
    
                    // Menyimpan data yang berhasil disinkronisasi ke localStorage
                    saveToLocalStorage('LIST_TOKEN', token);
                    saveToLocalStorage('DATA_SETTING', DataJSON);
                    
                    // Menggunakan konfirmasi dengan tombol OK untuk refresh
                    if (confirm('SINKRONISASI BERHASIL, LANJUT SETINGAN BERIKUTNYA!')) {
                        location.reload(); // Refresh halaman jika pengguna klik OK
                    }
                } else {
                    // Jika struktur data dari server tidak sesuai
                    alert('SYNC DATA GAGAL: Data yang diterima tidak sesuai format.');
                }
            },
            
            error: function(xhr, status, error) {
                // Menampilkan pesan kesalahan secara lebih lengkap
                const errorMessage = `
                    SYNC DATA GAGAL
                    Status: ${status}
                    Error: ${error}
                    Response Text: ${xhr.responseText || 'Tidak ada respon dari server'}
                `;
                alert(errorMessage);
            }
        });
    }
    
    // Menampilkan modal settingan
    $("#set-modal").on("click", function() {
        var lastSelctspeed = SavedSettingData.waktuTunggu;
            if (lastSelctspeed) {
                $('input[name="waktu-tunggu"][value="' + lastSelctspeed + '"]').prop('checked', true);
            }

        var lastSelctspeed2 = SavedSettingData.KoinGroup;
        if (lastSelctspeed2) {
                $('input[name="koin-group"][value="' + lastSelctspeed2 + '"]').prop('checked', true);
        }
        UIkit.modal("#modal-setting").show();
    });

    $('#syncDATA').on('click', function() {       
         importDataJSON(); 
        // toastr.success('SINKRONISASI BERHASIL!!,<br/> LANJUTKAN KE SETTINGAN');
        // alert('SINKRONISASI BERHASIL, LANJUTKAN KE SETTINGAN!!');
        //location.reload();
     });

     highlightEmptyInputs();
    // Function to highlight empty inputs with red background
    function highlightEmptyInputs() {
        $('.uk-input').each(function() {
            if ($(this).val().trim() === '') {
                $(this).toggleClass('uk-form-danger');
            } else {
                $(this).removeClass('uk-form-danger');
            }
        });
    }

    // Fungsi untuk memfilter dan menyimpan pilihan ke localStorage
    function filterTokens() {
        const FilterTokens = getFromLocalStorage("LIST_TOKEN", []);

        // Ambil pilihan CEX
        const selectedCEX = $('.cex-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        // Ambil pilihan DEX pair
        const selectedDexPair = $('.dexpair-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        // Filter token berdasarkan CEX, DEX pair, dan status true
        const filteredTokens = FilterTokens.filter(token => 
            selectedCEX.includes(token.cex) && 
            selectedDexPair.includes(token.pairdex) &&
            token.status === true
        );

        // Simpan data yang difilter ke dalam localStorage
        saveToLocalStorage("PILIH_CEX", selectedCEX);
        saveToLocalStorage("PILIH_DEX_PAIR", selectedDexPair);
        saveToLocalStorage("JmlFilterKoin", filteredTokens.length);
        
        return filteredTokens;
    }

    // Fungsi load checkbox dex dan teks sinyal
    function loadSelectedOptions() {
    
        // Set checkbox DEX berdasarkan pilihan yang tersimpan
        $('#D1INCH').prop('checked', selectedDEX.includes('1INCH'));
        $('#D0X').prop('checked', selectedDEX.includes('0X'));
        $('#DPARASWAP').prop('checked', selectedDEX.includes('PARASWAP'));
        $('#DODOS').prop('checked', selectedDEX.includes('ODOS'));
        $('#DKYBERSWAP').prop('checked', selectedDEX.includes('KYBERSWAP'));
    
        // Set checkbox CEX sesuai pilihan yang tersimpan
        $('.cex-checkbox').each(function() {
            $(this).prop('checked', selectedCEX.includes($(this).val()));
        });
    
        // Set checkbox DEX pair sesuai pilihan yang tersimpan
        $('.dexpair-checkbox').each(function() {
            $(this).prop('checked', selectedDexPair.includes($(this).val()));
        });
    
        // Set tampilan jumlah token yang difilter
        const filteredCount = filterTokens().length;
        $('label#JmlFilterKoin').text(filteredCount);
    
        // Sembunyikan tombol #startSCAN jika ada token yang terfilter
        if (filteredCount > 0) {
            $("#startSCAN").show();
        } else {
            $("#startSCAN").hide();
        }   
    }    
    
    //menampilkan jumlah token yang difilter
    $('.cex-checkbox, .dexpair-checkbox').on('change', function() {
         // Set tampilan jumlah token yang difilter
         const filteredCount = filterTokens().length;
         $('label#JmlFilterKoin').text(filteredCount);
         location.reload();
         // Sembunyikan tombol #startSCAN jika ada token yang terfilter
         if (filteredCount > 0) {
             $("#startSCAN").show();
         } else {
             $("#startSCAN").hide();
         }   
    });

    // Fungsi untuk memvalidasi pilihan DEX
    function validateDEXSelection() {
        const isAnyChecked = 
                            $("#D1INCH").prop('checked') || 
                            $("#DODOS").prop('checked') || 
                            $("#D0X").prop('checked') || 
                            $("#DKYBERSWAP").prop('checked') || 
                            $("#DPARASWAP").prop('checked');

        if (!isAnyChecked) {
            $("button#startSCAN.uk-button.uk-button-primary").hide();
            $("#cek").append('SILAKAN PILIH DEX!!<br>');
        } else {
            location.reload();
            $("button#startSCAN.uk-button.uk-button-primary").show();
        }
    }
    // fungsi perubahan checbox DEX
    $('#D1INCH, #D0X, #DPARASWAP, #DODOS, #DKYBERSWAP').change(function () {
        validateDEXSelection();

        // Membuat array selectedDEX berdasarkan checkbox yang tercentang
        selectedDEX = [
            $('#D1INCH').is(':checked') ? '1INCH' : null,
            $('#D0X').is(':checked') ? '0X' : null,
            $('#DPARASWAP').is(':checked') ? 'PARASWAP' : null,
            $('#DODOS').is(':checked') ? 'ODOS' : null,
            $('#DKYBERSWAP').is(':checked') ? 'KYBERSWAP' : null
        ].filter(Boolean); // Menghapus nilai null dari array

        // Simpan pilihan DEX yang terpilih ke localStorage
        saveToLocalStorage('PILIH_DEX', selectedDEX);
        
        // Memperbarui tampilan berdasarkan pilihan DEX
        updateTableVisibility();  // Panggil setelah mendapatkan selectedDEX
    });

    // Fungsi untuk memperbarui tampilan tabel dan sinyal sesuai pilihan DEX
    function updateTableVisibility() {
        // Sembunyikan semua elemen sinyal-item terlebih dahulu
        $('#sinyal-container .sinyal-item').hide();

        // Tampilkan sinyal sesuai dengan pilihan DEX
        selectedDEX.forEach(function(dex) {
            // Cari elemen dengan atribut data-dex yang sesuai dan tampilkan
            $('#sinyal-container .sinyal-item[data-dex="' + dex + '"]').show();
        });

        // Sembunyikan elemen lainnya yang terkait dengan tabel
        $(".dx_1inch, .dx_odos, .dx_0x, .dx_kyberswap, .dx_paraswap").hide();

        if ($('#D1INCH').is(':checked')) {
            $(".dx_1inch").show();
        }

        if ($('#DODOS').is(':checked')) {
            $(".dx_odos").show();
        }

        if ($('#D0X').is(':checked')) {
            $(".dx_0x").show();
        }

        if ($('#DPARASWAP').is(':checked')) {
            $(".dx_paraswap").show();
        }

        if ($('#DKYBERSWAP').is(':checked')) {
            $(".dx_kyberswap").show();
        }
    }

    //FUNGSI UTAMA BUTTON START
    $("#startSCAN").on("click", function() {
        // Hapus semua baris dalam tabel <tbody> dan nonaktifkan input
        const filteredTokens = filterTokens();
        $('tbody tr').remove();
        form_off()
        // Menonaktifkan semua elemen di dalam div tertentu
        $('#syncDATA, #set-modal, #cek_wallet, a').css('pointer-events', 'none').css('opacity', '0.4');
    
        var selectedOption = $("input[name='toggle']:checked").val();
        if (selectedOption === "option1") {
            // Lakukan sesuatu jika option 1 dipilih, misalnya membalik urutan tokens
            filteredTokens.reverse();
        }
    
        // Menyimpan waktu mulai (start time) ke localStorage menggunakan saveToLocalStorage
        var startTime = new Date().getTime();
        saveToLocalStorage('startTime', startTime); // Menggunakan saveToLocalStorage
    
        // Menyembunyikan tombol startSCAN dan menampilkan tombol refresh
        $("#startSCAN").hide();
        
        // Pastikan tombol `refresh` tetap aktif setelah `form_off()`
        $("#refresh").show().prop('disabled', false);
    
        // Menampilkan nilai FilterPNL
        $("#LFilterPNL").text("" + SavedModalData.FilterPNL + "$");
    
        // Memanggil fungsi yang diperlukan setelah klik startSCAN
        setNullInfo();      // Reset informasi

        if (!SavedDataID) {
            CekIdentitas(); 
        }
        // Mengirim status "ONLINE" ke Telegram
        sendStatusTELE(user, 'ONLINE');
    
        // Mulai proses pemrosesan token
        processTokenData(filteredTokens, groupSize);
    });    
    
    //FUNGSI AUTORUN    
    $('input#Cautorun').change(function() {
        if ($(this).is(':checked')) {
            autorun=true;
        } else {
            autorun=false;
        }
    });
    
   // FUNGSI CHECKBOX DISABLE/ENABLE COIN
    $(document).on('click', '.statusKoinCheckbox', function() {
        // Ambil data dari localStorage
        var coinData = getFromLocalStorage('LIST_TOKEN', {}) || [];   
        var symbol = $(this).data('symbol');
        var cex = $(this).data('cex');
        var status = $(this).is(':checked');

        // Validasi data symbol dan cex sebelum lanjut
        if (!symbol || !cex) {
            toastr.error("Data symbol atau CEX tidak valid!");
            return;
        }
        
        let updated = false;
        coinData.forEach((token) => {
            if (token.symbol === symbol && token.cex === cex) {
                token.status = status; // Update status token
                updated = true;
            }
        });

        if (updated) {
            // Simpan perubahan ke localStorage
            saveToLocalStorage('LIST_TOKEN', coinData);
            
            // Update objek SavedSettingData, jika digunakan
            SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
            
            // Update jumlah koin aktif
            coinTrueStatus();
            
            toastr.success("STATUS KOIN '" + symbol + "' & CEX:"+cex.toUpperCase()+" BERUBAH");
        } else {
            toastr.error("Koin dengan symbol '" + symbol + "' dan CEX '" + cex + "' tidak ditemukan!");
        }
    });

  
    var grupKoin = [];
    var currentGrupKoinTotalRequests = 0;
    var currentGrupKoinRequests = 0;
    var currentProcessingIndex = 0;
   // Fungsi untuk memproses data token
    function processTokenData(tokens, groupSize) {
        saveToLocalStorage("counter", 0); // Menggunakan saveToLocalStorage
        var tokensWithTrueStatus = tokens.filter(function(token) {
            return token.status === true;
        });

        // Menghitung jumlah grup yang dibutuhkan
        var numOfGroups = Math.ceil(tokensWithTrueStatus.length / groupSize);
       // console.log("Jumlah GRoup" + numOfGroups)
        grupKoin = [];
        currentProcessingIndex = 0;
        for (var i = 0; i < numOfGroups; i++) {
            var startIdx = i * groupSize;
            var endIdx = (i + 1) * groupSize;
            var tokenGroup = tokensWithTrueStatus.slice(startIdx, endIdx);
            //digrupkan dulu
            grupKoin.push(tokenGroup);
        }

        //jalankan grup pertama
        prosesGroup(0);
    }

    function prosesGroup(index){
        //reset jumlah request
        currentGrupKoinRequests = 0;

        //set current index
        currentProcessingIndex = index;

        //grup koin yg saat ini diproses
        let grup = grupKoin[currentProcessingIndex];

        //hitung total request seharusnya untuk grup saat ini
        //dapatkan jmlh dex yg discan
        let jmlhModal = 0;
        if($('#D1INCH').is(':checked')) {
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DODOS').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#D0X').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DPARASWAP').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }
        if($('#DKYBERSWAP').is(':checked')) { 
            if($('#ls').is(':checked')) { jmlhModal++; }
            if($('#rs').is(':checked')) { jmlhModal++; }
        }

        currentGrupKoinTotalRequests = grup.length * jmlhModal;
        //console.log("JUMLAH SCAN : "+currentGrupKoinTotalRequests);
       // Proses anggota dari grup koin saat ini
        grup.forEach(function(token, IndexAnggota) {
            var symbol = GantiSymbol(token.symbol, "_USDT", "");
            var counter = getFromLocalStorage('counter', 0); // Menggunakan getFromLocalStorage
            var jcounter = counter + 1;
            saveToLocalStorage("counter", jcounter); // Menggunakan saveToLocalStorage

            var delay = SavedSettingData.jedaKoin * IndexAnggota; // Hitung delay
            // console.log(`Jeda untuk token ${symbol}: ${delay} ms`);

            setTimeout(function() {
               // console.log(`Memulai pemrosesan token ${symbol}`);
                updateProgress(jcounter, symbol);  // Proses token
                Scanning(token, IndexAnggota);
                feeGasGwei();
            }, delay);
        });

    }

    //fungsi ini dipanggil setiap selesai request, baik error atau ndak.
    function selesaiProsesAnggota(){
        //increment currentGrupKoinRequests
        currentGrupKoinRequests++;

        //cek apakah semua anggota sdh diproses
        if(currentGrupKoinRequests == currentGrupKoinTotalRequests){
            //semua anggota sudah diproses. lanjutkan prosesGroup berikutnya
            //tapi cek dulu, apakah grupKoin berikutnya masih ada
            if(currentProcessingIndex < grupKoin.length){
                setTimeout(function(){
                    prosesGroup(currentProcessingIndex+1);
                },SavedSettingData.jedaTimeGroup);
               // console.log("Waktu GRUP : ",SavedSettingData.jedaTimeGroup);
            }
        }
    }

    function GantiSymbol(simbol,awal,akhir) {
        if (simbol.endsWith(awal)) {
            var pasanganPerdagangan = simbol.replace(awal,akhir);
            return pasanganPerdagangan;
        }
        return simbol;
    }

   // Event listener untuk tombol cek_wallet
    $('#cek_wallet').on('click', function() {        
        // Reset status keberhasilan
        isGateSuccess = false;
        isBinanceSuccess = false;
        isKucoinSuccess = false;
        isBitgetSuccess = false;
        isBybitSuccess = false;
        // Panggil fungsi untuk mengecek wallet dari tiap CEX
        CekfeeWDGATE();
        CekfeeWDBINANCE();
        CekfeeWDKUCOIN();
        CekfeeWDBITGET();
        CekfeeWDBYBIT();
    });

    function checkAllUpdatesCompleted() {
        // Jika semua sukses, simpan waktu pembaruan dan tampilkan pesan akhir
        if (isGateSuccess && isBinanceSuccess && isKucoinSuccess && isBitgetSuccess && isBybitSuccess) {
            const lastModifiedTime = new Date().toLocaleString();
            saveToLocalStorage("LASTUPDATE_FEEWD", lastModifiedTime);
            toastr.success("SUKSES UPDATE SEMUA WALLET CEX, SILAKAN REFRESH!!");
        }
    }
    
    // Fungsi untuk mendapatkan fee gas dalam Gwei
    function feeGasGwei() {
        $.when(
            $.ajax({
                url: 'https://data-api.binance.vision/api/v3/ticker/24hr?symbol=' + DTChain.BaseFEEDEX,
                method: 'GET'
            }),
            $.ajax({
                url: 'https://gas.api.infura.io/v3/9d0429abadc34232af7d5c0e6ab98631/networks/' + DTChain.Kode_Chain + '/suggestedGasFees',
                method: 'GET'
            })
        ).done(function(PriceResponse, gasResponse) {
            var lastPrice = PriceResponse[0].lastPrice;
            saveToLocalStorage('PriceGAS', lastPrice); // Menggunakan saveToLocalStorage
            var mediumGasFee = gasResponse[0].low.suggestedMaxFeePerGas;
            saveToLocalStorage('gasGWEI', mediumGasFee); // Menggunakan saveToLocalStorage
            
            $("#LGwei").text("" + parseFloat(getFromLocalStorage('gasGWEI', 0)).toFixed(2)); // Menggunakan getFromLocalStorage
            console.log(" CHAIN : " + DTChain.Nama_Chain.toUpperCase());
            console.log(" PRICE GAS : " + getFromLocalStorage('PriceGAS', 0));
            console.log(" GWEI : " + parseFloat(getFromLocalStorage('gasGWEI', 0)));

            // console.log('Medium Gas Fee:', mediumGasFee);
        }).fail(function(xhr, status, error) {
            console.error('Failed to fetch data:', error);
        });
    }

    // fungsi mengecek status DEPO & WD BINANCE
    function StatusWalletBINANCE(coin) {
        return new Promise((resolve, reject) => {
            // Mendapatkan data dari localStorage dengan prefix menggunakan helper getFromLocalStorage
            const walletData = getFromLocalStorage("FEEWD_BINANCE");
    
            if (walletData) {
                // Mencari koin yang sesuai dengan parameter coin
                const selectedCoin = walletData.find(item => item.coin === coin);
    
                // Jika koin ditemukan
                if (selectedCoin) {
                    // Tentukan status deposit dan withdraw
                    const depositActive = selectedCoin.depositEnable; // true if deposit is active
                    const withdrawActive = selectedCoin.withdrawEnable; // true if withdraw is active
                    resolve({ depositActive, withdrawActive });
                } else {
                    toastr.error("Koin " + coin + " tidak ditemukan.");
    
                    // Kembalikan status false jika koin tidak ditemukan
                    resolve({ depositActive: false, withdrawActive: false });
                }
            } else {
                toastr.error("CEK,UPDATE WALLET BINANCE DAHULU!!");
                // Kembalikan status false jika data wallet tidak tersedia
                resolve({ depositActive: false, withdrawActive: false });
            }
        });
    }
    //fungsi cek FEE WD per TOKEN BINANCE
    function calculateSignature(query_string,ApiSecret) {
        const secretKey = ApiSecret;
        const signature = CryptoJS.HmacSHA256(query_string, secretKey).toString(CryptoJS.enc.Hex);
        return signature;
    }
    
    //fungsi cek FEE WD per TOKEN BINANCE
    function CekfeeWDBINANCE() {

        const ApiKey = CONFIG_CEX.BINANCE.ApiKey;
        const ApiSecret = CONFIG_CEX.BINANCE.ApiSecret;
        const timestamp = Date.now().toString();
        const queryString = `timestamp=${timestamp}`;
        const signature = calculateSignature(queryString,ApiSecret);
    
        const apiUrl = "https://api.binance.me/sapi/v1/capital/config/getall";
    
        $.ajax({
            url: `${apiUrl}?timestamp=${timestamp}&signature=${signature}`,
            method: "GET",
            headers: {
                "X-MBX-ApiKey": ApiKey,
            },
            success: function (data) {
                const coinsWithNetwork = data.filter(function (item) {
                    return item.networkList.some(function (network) {
                        return network.network === DTChain.CEXCHAIN.BINANCE.chainCEX;
                    });
                });
    
                // Ambil hanya koin beserta status deposit dan withdraw untuk jaringan 
                const coinDepositWithdrawStatus = coinsWithNetwork.map(function (item) {
                    const Network = item.networkList.find(function (network) {
                        return network.network === DTChain.CEXCHAIN.BINANCE.chainCEX;
                    });
    
                    return {
                        coin: item.coin,
                        feeWDs: Network ? Network.withdrawFee : 0,
                        depositEnable: Network ? Network.depositEnable : false,
                        withdrawEnable: Network ? Network.withdrawEnable : false
                    };
                });
    
                // Simpan data pada localStorage dengan helper
              //  toastr.error('UPDATE FEE WD BINANCE BERHASIL, SILAKAN REFRESH!!');
                saveToLocalStorage("FEEWD_BINANCE", coinDepositWithdrawStatus);
                 toastr.info("SUKSES, CEK UPDATE WALLET BINANCE");
                isBinanceSuccess = true; // Tandai sukses
                checkAllUpdatesCompleted();
            },
            error: function () {
                toastr.error('UPDATE FEE WD BINANCE GAGAL, SILAKAN REFRESH!!');
            }
        });
    }

    // fungsi mengecek status DEPO & WD GATE
    function StatusWalletGATE(currency) {
        return new Promise((resolve, reject) => {
            $.get('https://proxykiri.awokawok.workers.dev/?https://api.gateio.ws/api/v4/wallet/currency_chains?currency=' + currency, function(response) {
                var ChainCoin = response.find(function(chain) {
                    return chain.chain === DTChain.CEXCHAIN.GATE.chainCEX;
                });

                if (ChainCoin) {
                    // Tentukan status deposit dan withdraw
                    var depositActive = !ChainCoin.is_deposit_disabled; // true if deposit is active
                    var withdrawActive = !ChainCoin.is_withdraw_disabled; // true if withdraw is active
                    
                   // Resolve with deposit and withdraw statuses
                    resolve({ depositActive, withdrawActive });
                    
                } else {
                    toastr.error("GAGAL CEK WALLET GATE!! TOKEN:"+currency);
                    resolve({ depositActive: false, withdrawActive: false }); // Resolving with false if chain not found
                }

            }).fail(function(xhr, status, error) {
                console.error(status, error);
                reject(error); // Reject the promise on error
            });
        });
    }
    //fungsi cek FEE WD per TOKEN GATE
    function CekfeeWDGATE() {
        var key = CONFIG_CEX.GATE.ApiKey;
        var secret = CONFIG_CEX.GATE.ApiSecret;
        var host = "https://proxykanan.awokawok.workers.dev/?https://api.gateio.ws";
        var prefix = "/api/v4";
        var method = "GET";
        var url = "/wallet/withdraw_status";
        var query_paraswapm = "";
        var body_paraswapm = "";
        var timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    
        var body_hash = CryptoJS.SHA512(body_paraswapm).toString(CryptoJS.enc.Hex);
    
        var sign_string = method + "\n" + prefix + url + "\n" + query_paraswapm + "\n" + body_hash + "\n" + timestamp;
        var hmac = CryptoJS.HmacSHA512(sign_string, secret);
        var sign = hmac.toString(CryptoJS.enc.Hex);
    
        var full_url = host + prefix + url;
    
        $.ajax({
            url: full_url,
            method: method,
            headers: {
                'Timestamp': timestamp,
                'KEY': key,
                'SIGN': sign
            },
            success: function(response) {
                var filteredData = response.map(function(item) {
                    return {
                        currency: item.currency,
                        feeWD: item.withdraw_fix_on_chains && item.withdraw_fix_on_chains[DTChain.CEXCHAIN.GATE.chainCEX] ? item.withdraw_fix_on_chains[DTChain.CEXCHAIN.GATE.chainCEX] : null
                    };
                }).filter(function(item) {
                    return item.currency && item.feeWD;
                });
    
                // Simpan data fee WD yang telah difilter ke localStorage menggunakan saveToLocalStorage
                saveToLocalStorage("FEEWD_GATE", filteredData);
                isGateSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET GATE");
                checkAllUpdatesCompleted();
               // toastr.error('UPDATE FEE WD GATE BERHASIL, SILAKAN REFRESH!!');
            },
            error: function() {
                toastr.error('UPDATE FEE WD GATE GAGAL, SILAKAN REFRESH!!');
            }
        });
    }

    //fungsi mengecek status DEPO & WD KUCOIN   
    function CekfeeWDKUCOIN() {
        const ApiKey = CONFIG_CEX.KUCOIN.ApiKey;
        const ApiSecret = CONFIG_CEX.KUCOIN.ApiSecret;
        const ApiPassphrase = CONFIG_CEX.KUCOIN.ApiPassphrase;
        const timestamp = Date.now().toString();
        const queryString = `timestamp=${timestamp}`; // Query string yang sesuai
        const signature = calculateSignature(queryString,ApiSecret);

        const apiUrl = "https://hello-world-broken-hill-2492.yoeazd.workers.dev/?https://api.kucoin.com/api/v3/currencies"; // URL API yang sesuai

        $.ajax({
            url: `${apiUrl}?${queryString}&signature=${signature}`,
            method: "GET",
            headers: {
                "KC-API-KEY": ApiKey,
                "KC-API-TIMESTAMP": timestamp,
                "KC-API-SIGN": signature,
                "KC-API-PASSPHRASE": CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(ApiPassphrase, ApiSecret)), // Ganti dengan passphrase yang sesuai
                "KC-API-KEY-VERSION": "2",
            },
            success: function (data) {
                if (data.code === "200000") { // Pastikan kode respon sukses

                    // Filter berdasarkan chainName yang sesuai
                    const filteredCoins = data.data.filter(function (item) {
                        return item.chains && item.chains.some(function (network) {
                            return network.chainName === DTChain.CEXCHAIN.KUCOIN.chainCEX; // Ganti CHAINCEX dengan nama jaringan yang diinginkan
                        });
                    });

                    // Ambil hanya koin beserta status deposit dan withdraw untuk jaringan yang sesuai
                    const coinDepositWithdrawStatus = filteredCoins.map(function (item) {
                        const network = item.chains.find(function (network) {
                            return network.chainName === DTChain.CEXCHAIN.KUCOIN.chainCEX; // Ganti CHAINCEX dengan nama jaringan yang diinginkan
                        });

                        return {
                            coin: item.currency,
                            feeWDs: network ? network.withdrawalMinFee : 0,
                            depositEnable: network ? network.isDepositEnabled : false,
                            withdrawEnable: network ? network.isWithdrawEnabled : false,
                            contractAddress: network ? network.contractAddress : null,
                        };
                    });

                    // Simpan data pada localStorage
                   // toastr.error('UPDATE FEE WD KUCOIN BERHASIL, SILAKAN REFRESH!!');
                    saveToLocalStorage("FEEWD_KUCOIN", coinDepositWithdrawStatus);
                    toastr.info("SUKSES, CEK UPDATE WALLET KUCOIN");
                    isKucoinSuccess = true; // Tandai sukses
                    checkAllUpdatesCompleted();
                } else {
                    toastr.error('Gagal mendapatkan data, kode: ' + data.code);
                }
            },
            error: function (xhr, status, error) {
                toastr.error('UPDATE FEE WD KUCOIN GAGAL, SILAKAN REFRESH!!');
            }
        });
    }
    //fungsi cek FEE WD per TOKEN KUCOIN
    function StatusWalletKUCOIN(coin) {
        return new Promise((resolve, reject) => {
            // Mendapatkan data dari localStorage dengan prefix menggunakan helper getFromLocalStorage
            const walletData = getFromLocalStorage("FEEWD_KUCOIN");
    
            if (walletData) {
                // Mencari koin yang sesuai dengan parameter coin
                const selectedCoin = walletData.find(item => item.coin === coin);
    
                // Jika koin ditemukan
                if (selectedCoin) {
                    // Tentukan status deposit dan withdraw
                    const depositActive = selectedCoin.depositEnable; // true if deposit is active
                    const withdrawActive = selectedCoin.withdrawEnable; // true if withdraw is active
                    
                    // Kembalikan status deposit dan withdraw
                    resolve({ depositActive, withdrawActive });
                } else {
                    toastr.error("Koin " + coin + " tidak ditemukan.");
    
                    // Kembalikan status false jika koin tidak ditemukan
                    resolve({ depositActive: false, withdrawActive: false });
                }
            } else {
                toastr.error("CEK,UPDATE WALLET KUCOIN DAHULU!!");
                // Kembalikan status false jika data wallet tidak tersedia
                resolve({ depositActive: false, withdrawActive: false });
            }
        });
    }

    //fungsi cek FEE WD per TOKEN BITGET
    function CekfeeWDBITGET(){
        $.ajax({
            url: 'https://api.bitget.com/api/v2/spot/public/coins',
            method: "GET",
            success: function(response) {
                // Filter data untuk coin dengan network BSC
                //console.log(response);
                const coinsWithChain = response.data.filter(function(item) {
                return item.chains.some(function(chain) {
                        return chain.chain === DTChain.CEXCHAIN.BITGET.chainCEX;
                    });
                });

                // Ambil hanya koin beserta status deposit dan withdraw untuk chain SOL
                const coinDepositWithdrawStatus = coinsWithChain.map(function(item) {
                    const CEXChain = item.chains.find(function(chain) {
                        return chain.chain === DTChain.CEXCHAIN.BITGET.chainCEX;
                    });
                    
                    return {
                        coin: item.coin,
                        feeWDs: CEXChain ? CEXChain.withdrawFee : 0,
                        depositEnable: CEXChain ? CEXChain.rechargeable === "true" : false,
                        withdrawEnable: CEXChain ? CEXChain.withdrawable === "true" : false
                    };
                });

                // Simpan data pada localStorage
                saveToLocalStorage("FEEWD_BITGET", coinDepositWithdrawStatus);
                isBitgetSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET BITGET");
                checkAllUpdatesCompleted();
            },
            error: function(xhr, status, error) {
                toastr.error('UPDATE FEE WD BITGET GAGAL, SILAKAN REFRESH!!');
            }
        });
    }
    //fungsi cek FEE WD per TOKEN BITGET  
    function StatusWalletBITGET(coin) {
        return new Promise((resolve, reject) => {
            // Mendapatkan data dari localStorage dengan prefix menggunakan helper getFromLocalStorage
            const walletData = getFromLocalStorage("FEEWD_BITGET");
    
            if (walletData) {
                // Mencari koin yang sesuai dengan parameter coin
                const selectedCoin = walletData.find(item => item.coin === coin);
    
                // Jika koin ditemukan
                if (selectedCoin) {
                    // Tentukan status deposit dan withdraw
                    const depositActive = selectedCoin.depositEnable; // true if deposit is active
                    const withdrawActive = selectedCoin.withdrawEnable; // true if withdraw is active
    
                    // Kembalikan status deposit dan withdraw
                    resolve({ depositActive, withdrawActive });
                } else {
                    toastr.error("Koin " + coin + " tidak ditemukan.");
    
                    // Kembalikan status false jika koin tidak ditemukan
                    resolve({ depositActive: false, withdrawActive: false });
                }
            } else {
                toastr.error("CEK,UPDATE WALLET BITGET DAHULU!!");
                // Kembalikan status false jika data wallet tidak tersedia
                resolve({ depositActive: false, withdrawActive: false });
            }
        });
    }

    function calculateSignatureBybit(apiKey, timestamp, recvWindow) {
        const secretKey = CONFIG_CEX.BYBIT.ApiSecret; // Replace with your actual secret key
        const dataToSign = timestamp + apiKey + recvWindow;
        const signature = CryptoJS.HmacSHA256(dataToSign, secretKey).toString(
          CryptoJS.enc.Hex
        );
        return signature;
      }
    //fungsi cek FEE WD per TOKEN BYBIT  
    function CekfeeWDBYBIT() {
        const ApiKey = CONFIG_CEX.BYBIT.ApiKey;
        const chainTypeConfig = CONFIG_CEX.BYBIT.chainCEX; // Ambil nilai chainType dari konfigurasi
        const timestamp = Date.now().toString();
        const recvWindow = "5000";
        const signature = calculateSignatureBybit(ApiKey, timestamp, recvWindow);
    
        const apiUrl = "https://api.bybit.com/v5/asset/coin/query-info";
    
        $.ajax({    
            url: apiUrl,
            method: "GET",
            headers: {
                "X-BAPI-SIGN": signature,
                "X-BAPI-API-KEY": ApiKey,
                "X-BAPI-TIMESTAMP": timestamp,
                "X-BAPI-RECV-WINDOW": recvWindow,
            },
            success: function (data) {
                dataCoins = data.result.rows;
    
                // Filter berdasarkan chainType yang sesuai dengan konfigurasi di chainTypeConfig
                const coinsWithNetwork = dataCoins.filter(function (item) {
                    return item.chains.some(function (network) {
                        return network.chain === chainTypeConfig;  // Menggunakan nilai dari config
                    });
                });
    
                const coinDepositWithdrawStatus = coinsWithNetwork.map(function (item) {
                    const Network = item.chains.find(function (network) {
                        return network.chain === chainTypeConfig;
                    });
    
                    return {
                        coin: item.coin,
                        feeWDs: Network ? Network.withdrawFee : 0,
                        depositEnable: Network ? (Network.chainDeposit === '1') : false,
                        withdrawEnable: Network ? (Network.chainWithdraw === '1') : false
                    };
                });
                
                isBybitSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET BYBIT");
                checkAllUpdatesCompleted();
                // Simpan data pada localStorage
                saveToLocalStorage("FEEWD_BYBIT",coinDepositWithdrawStatus);
            },
            error: function (xhr, status, error) {
                toastr.error('UPDATE WALLET BYBIT GAGAL, MASALAH KONEKSI!!');
            }
        });
    }    

    //fungsi cek FEE WD per TOKEN BYBIT  
    function StatusWalletBYBIT(coin) {
        return new Promise((resolve, reject) => {
            // Mendapatkan data dari localStorage dengan prefix menggunakan helper getFromLocalStorage
            const walletData = getFromLocalStorage("FEEWD_BYBIT");
    
            if (walletData) {
                // Mencari koin yang sesuai dengan parameter coin
                const selectedCoin = walletData.find(item => item.coin === coin);
    
                // Jika koin ditemukan
                if (selectedCoin) {
                    // Tentukan status deposit dan withdraw
                    const depositActive = selectedCoin.depositEnable; // true if deposit is active
                    const withdrawActive = selectedCoin.withdrawEnable; // true if withdraw is active
    
                   
                    // Kembalikan status deposit dan withdraw
                    resolve({ depositActive, withdrawActive });
                } else {
                    toastr.error("Koin " + coin + " tidak ditemukan.");
    
                    // Kembalikan status false jika koin tidak ditemukan
                    resolve({ depositActive: false, withdrawActive: false });
                }
            } else {
                toastr.error("CEK,UPDATE WALLET BYBIT DAHULU!!");
                // Kembalikan status false jika data wallet tidak tersedia
                resolve({ depositActive: false, withdrawActive: false });
            }
        });
    }
    //entry cell Price CEX Pada TABEL
    function GetIdCellCEX(action, posisi, NameToken, cex) {
        return action === "sell" 
            ? $("#buy_" + cex + "_" + posisi + "_" + NameToken)  
            : action === "buy" 
                ? $("#" + posisi + "_sell_" + cex + "_" + NameToken) 
                : null; // Mengembalikan null jika action tidak dikenali
    }
    //entry cell Price DEX Pada TABEL
    function GetIdCellDEX(action, posisi, NameToken, cex) {
        return action === "sell" 
            ? $("#" + posisi + "_buy_" + cex + "_" + NameToken)  
            : action === "buy" 
                ? $("#sell_" + cex + "_" + posisi + "_" + NameToken) 
                : null; // Mengembalikan null jika action tidak dikenali
    }
    
    // Fungsi untuk menampilkan LOG hasil PENGECEKAN
    function LogEksekusi(dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee, wd, selisihPersen,cex,sc_input, des_input, sc_output, des_output) {
        console.log("----- "+ token.toUpperCase() +" # " + posisi.toUpperCase()+' -----');
        console.log("##### "+ cex.toUpperCase() +" VS " + dex.toUpperCase()+' #####');
        console.log(" MODAL : " + modal);
        console.log(" PRICE BUY : " + priceBUY);
        console.log(" SC IN : " + sc_input);
        console.log(" DES IN : " + des_input);
        console.log(" PRICE SELL : " + priceSELL);
        console.log(" SC OUT : " + sc_output);
        console.log(" DES OUT : " + des_output);
        console.log(" PNL : " + PNL);
        console.log(" FILTER PNL : " + SavedModalData.FilterPNL);
        console.log(" TOTAL FEE : " + totalFee);
        console.log(" FEE WD : " + wd);
        console.log(" GAS : " + getFromLocalStorage('gasGWEI', 0)); // Menggunakan getFromLocalStorage
        console.log(" PRICE " + DTChain.BaseFEEDEX + " : " + getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
        console.log(" FEE SWAP : " + FeeSwap);
        console.log(" PNL NETTO : " + (Number(PNL) - Number(totalFee)));
        console.log(" PERSEN : " + selisihPersen);
        console.log("-------------------------  ");
    }
    
   //fungsi untuk menampilkan hasil scan pada tabel sesuai token pada cex
    function EntryTableCEX(action, posisi, cex, SymbolCEX, NameToken, price, wd, FeeSwap, totalFee) {
        let baseUrlTrade, baseUrlWithdraw, baseUrlDeposit;

        // Menentukan URL berdasarkan nilai cex
        if (cex === "GATE") {
            baseUrlTrade = `https://www.gate.io/trade/${SymbolCEX}_USDT`;
            baseUrlWithdraw = `https://www.gate.io/myaccount/withdraw/${NameToken}`;
            baseUrlDeposit = `https://www.gate.io/myaccount/deposit/${NameToken}`;
        } else if (cex === "BINANCE") {
            baseUrlTrade = `https://www.binance.com/en/trade/${SymbolCEX}_USDT`;
            baseUrlWithdraw = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${NameToken}`;
            baseUrlDeposit = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${NameToken}`;
        } else if (cex === "KUCOIN") {
            baseUrlTrade = `https://www.kucoin.com/trade/${SymbolCEX}-USDT`;
            baseUrlWithdraw = `https://www.kucoin.com/assets/withdraw/${NameToken}`;
            baseUrlDeposit = `https://www.kucoin.com/assets/coin/${NameToken}`;
        } else if (cex === "BITGET") { 
            baseUrlTrade = `https://www.bitget.com/spot/${SymbolCEX}USDT`;
            baseUrlWithdraw = `https://www.bitget.com/asset/withdraw`;
            baseUrlDeposit = `https://www.bitget.com/asset/recharge`;
        } else if (cex === "BYBIT") { 
            baseUrlTrade = `https://www.bybit.com/en/trade/spot/${SymbolCEX}/USDT`;
            baseUrlWithdraw = "https://www.bybit.com/user/assets/withdraw";
            baseUrlDeposit = "https://www.bybit.com/user/assets/deposit";
        } else {
            console.error("Unsupported exchange:", cex);
            return; // Keluar dari fungsi jika cex tidak dikenal
        }

        if (action === "sell") {
            $("#buy_" + cex + "_" + posisi + "_" + NameToken).html(
                `<a href="${baseUrlTrade}" target="_blank">
                    <label class="uk-text-primary">${price}</label>
                </a> 
                <a href="${baseUrlWithdraw}" target="_blank">
                    <br/> <label class="uk-text-primary">WD: ${wd.toFixed(2)}#SW:${FeeSwap.toFixed(3)}</label>
                </a>`
            );
        }

        if (action === "buy") {
            $("#" + posisi + "_sell_" + cex + "_" + NameToken).html(
                `<a href="${baseUrlTrade}" target="_blank">
                    <label class="uk-text-danger">${price}</label>
                </a>
                <a href="${baseUrlDeposit}" target="_blank">
                    <br/> <label class="uk-text-primary">DP: </label>
                    <label class="uk-text-danger">${totalFee.toFixed(2)}#SW:${parseFloat(FeeSwap).toFixed(3)}</label>
                </a>`
            );
        }
    }
    
   // Fungsi untuk menentukan warna berdasarkan nama CEX
    function getWarnaCEX(cex) {
        switch (cex.toUpperCase()) {
            case 'BINANCE':
                return '#e0a50c'; // Orange tua
            case 'GATE':
                return '#D5006D'; // Pink tua
            case 'KUCOIN':
                return '#096309'; // Hijau tua
            case 'BITGET':
                return '#1448ce'; // Biru muda
            case 'BYBIT':
                return '#17181f'; // Hitam pekat
            default:
                return 'black';
        }
    }

    // Fungsi untuk menampilkan sinyal hasil scan
    function InfoSinyal(side, action, posisi, DEXPLUS, NameToken, PNL, totalFee, cex) {
        // Menggunakan storagePrefix untuk membangun newLocalStorageKey
        var newLocalStorageKey = side + DEXPLUS + 'Sinyal';
        var newElementID = '#l' + side + DEXPLUS + 'Sinyal';

        // Mengambil sinyal saat ini dari localStorage
        var currentSinyal = parseInt(localStorage.getItem(storagePrefix + newLocalStorageKey) || "0", 10);
        var newSinyal = currentSinyal + 1;

        // Menyimpan sinyal baru ke localStorage
        saveToLocalStorage(newLocalStorageKey, newSinyal);
        $(newElementID).text(localStorage.getItem(storagePrefix + newLocalStorageKey));

        // Menentukan warna teks berdasarkan `cex` menggunakan fungsi getWarnaCEX
        var warnaCEX = getWarnaCEX(cex);

        // Membuat link berdasarkan aksi (sell/buy) dan cex, dengan warna cex sesuai
        var sLink = action === "sell" 
            ? `<a href='#buy_${cex}_${posisi}_${NameToken}' class='sell-link' >${NameToken} (<span style='color:${warnaCEX}; font-weight:bolder;'>${cex.toUpperCase()}:</span>${(PNL - totalFee).toFixed(1)}$)</a>` 
            : `<a href='#${posisi}_sell_${cex}_${NameToken}' class='buy-link' >${NameToken} (<span style='color:${warnaCEX}; font-weight:bolder;'>${cex.toUpperCase()}:</span>${(PNL - totalFee).toFixed(1)}$</a>`;

        // Menambahkan link ke elemen dengan ID yang sesuai
        $("#sinyal" + DEXPLUS.toLowerCase()).append(` ${sLink} |`);

        // Mengatur warna link berdasarkan aksi
        $("a." + (action === "sell" ? 'sell-link' : 'buy-link')).css('color', action === "sell" ? 'green' : 'red');

        // Menambahkan kelas 'ijo' ke elemen yang sesuai berdasarkan aksi
        if (action === "sell") {
            $("#" + posisi + "_buy_" + cex + "_" + NameToken).addClass('ijo');
            $("#buy_" + cex + "_" + posisi + "_" + NameToken).addClass('ijo');
        } else if (action === "buy") {
            $("#sell_" + cex + "_" + posisi + "_" + NameToken).addClass('ijo');
            $("#" + posisi + "_sell_" + cex + "_" + NameToken).addClass('ijo');
        }
    }

    // Fungsi untuk mendapatkan harga PAIR {buy/sell}
    function getPricePAIR(pair, callback) {
        let prices = { PriceRateSell: 0, PriceRateBuy: 0 };
        
        // Memeriksa apakah pair adalah "USDT" atau "USDC"
        if (pair === "USDT" || pair === "USDC") {
            callback({ PriceRateBuy: 1, PriceRateSell: 1 });
            return;
        }
        
        $.ajax({
            url: 'https://data-api.binance.vision/api/v3/ticker/24hr',
            data: { symbol: pair + "USDT" },
            success: function(response) {
                prices.PriceRateBuy = parseFloat(response.askPrice).toFixed(8);
                prices.PriceRateSell = parseFloat(response.bidPrice).toFixed(8);
                callback(prices);  // Mengirimkan prices melalui callback
            },
            error: function(xhr, status, error) {
                toastr.error('CEK KONEKSI ANDA, GAGAL DAPATKAN HARGA PAIRDEX!!');
                callback(prices);  // Kembalikan harga default jika gagal
            }
        });
    }

    // Fungsi untuk mendapatkan harga dari GATE dan mengintegrasikan dengan hasil getPricePAIR
    function getPriceGATE(coins, modal, index, cex, callback) {
        var ListFeeWDCEX = getFromLocalStorage("FEEWD_GATE", []);

        // Pastikan ListFeeWDCEX adalah array dan tidak kosong
        if (!Array.isArray(ListFeeWDCEX) || ListFeeWDCEX.length === 0) {
            toastr.error("UPDATE WALLET GATE DAHULU");
            return; // Hentikan eksekusi lebih lanjut
        }

        var ISERVERCORS = parseInt(getFromLocalStorage('DATA_SERVERCORS', 0));
        var indexrandom = Math.floor(Math.random() * SavedSettingData.SERVERCORS[ISERVERCORS].length);
        var selectedServer = SavedSettingData.SERVERCORS[ISERVERCORS][indexrandom];

        // Mendapatkan harga pair terlebih dahulu sebelum memproses harga dari Gate.io
            getPricePAIR(coins.pairdex, function(prices) {
                $.ajax({
                    url: selectedServer + 'https://api.gateio.ws/api/v4/spot/order_book?limit=5&currency_pair=' + coins.symbol + "_USDT",
                    method: 'GET',
                    timeout: parseInt(SavedSettingData.waktuTunggu) * 1000,
                    success: function(data) { 
                        if (data.asks.length === 0 || data.bids.length === 0) {
                            callback(null, null);  // Indicate success with no data
                            selesaiProsesAnggota();
                        } else {
                            var dataOUT = {};
                            dataOUT.price_buy = data.asks[0][0];
                            dataOUT.price_buy1 = data.asks[1][0];
                            dataOUT.price_buy2 = data.asks[2][0];
                            dataOUT.price_buy3 = data.asks[3][0];
                            dataOUT.vol_buy = (parseFloat(data.asks[0][1]) * dataOUT.price_buy).toFixed(2);
                            dataOUT.vol_buy1 = (parseFloat(data.asks[1][1]) * dataOUT.price_buy1).toFixed(2);
                            dataOUT.vol_buy2 = (parseFloat(data.asks[2][1]) * dataOUT.price_buy2).toFixed(2);
                            dataOUT.vol_buy3 = (parseFloat(data.asks[3][1]) * dataOUT.price_buy3).toFixed(2);

                            dataOUT.price_sell = data.bids[0][0];
                            dataOUT.price_sell1 = data.bids[1][0];
                            dataOUT.price_sell2 = data.bids[2][0];
                            dataOUT.price_sell3 = data.bids[3][0];
                            dataOUT.vol_sell = (parseFloat(data.bids[0][1]) * dataOUT.price_sell).toFixed(2);
                            dataOUT.vol_sell1 = (parseFloat(data.bids[1][1]) * dataOUT.price_sell1).toFixed(2);
                            dataOUT.vol_sell2 = (parseFloat(data.bids[2][1]) * dataOUT.price_sell2).toFixed(2);
                            dataOUT.vol_sell3 = (parseFloat(data.bids[3][1]) * dataOUT.price_sell3).toFixed(2);

                            dataOUT.symbol = coins.symbol;
                            dataOUT.modal = modal;
                            dataOUT.amount_in_sell = modal / data.asks[0][0];
                            dataOUT.amount_in_buy = modal / parseFloat(prices.PriceRateSell);
                            dataOUT.PriceRateBuy = parseFloat(prices.PriceRateBuy);
                            dataOUT.PriceRateSell = parseFloat(prices.PriceRateSell);

                            var feeFound = false;
                            for (var i = 0; i < ListFeeWDCEX.length; i++) {
                                var feeSymbol = ListFeeWDCEX[i].currency.trim().toUpperCase();
                                var currentSymbol = dataOUT.symbol.trim().toUpperCase();
                                
                                if (feeSymbol === currentSymbol) { 
                                    dataOUT.feeWD = parseFloat(ListFeeWDCEX[i].feeWD * data.asks[0][0]);
                                    feeFound = true;
                                    break;
                                }
                            }

                            $("#vol1_buy_" + cex + "_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>");
                            $("#vol2_buy_" + cex + "_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>");
                            $("#vol1_sell_" + cex + "_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>");
                            $("#vol2_sell_" + cex + "_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>");
                        
                            callback(null, dataOUT);
                        } 
                    },
                    error: function(error) {
                        callback(null, null);
                        toastr.error('KONEKSI GATE GAGAL TOKEN ' + coins.symbol + ' !!');
                        selesaiProsesAnggota();
                    }
                });
            });
    }

    // Fungsi untuk mengecek harga pada BINANCE
    function getPriceBINANCE(coins, modal, index,cex, callback) {
        var ISERVERCORS = parseInt(getFromLocalStorage('SERVERCORS'));
        const ListfeeWD = getFromLocalStorage("FEEWD_BINANCE");
    
        if (ListfeeWD === null) {
            toastr.error("UPDATE FEE WD BINANCE DAHULU!<br/>");
        }
    
        var symbol2 = GantiSymbol(coins.symbol, "USDT", "");
        
        // Mencari koin yang sesuai dengan parameter coin
        const selectedCoin = ListfeeWD.find(function (item) {
            return item.coin === symbol2;
        });
    
        var withdrawFee = 0; // Default value
        if (selectedCoin) {
            withdrawFee = selectedCoin.feeWDs;
        }

        getPricePAIR(coins.pairdex, function(prices) {
            $.ajax({
                url: "https://api.binance.me/api/v3/depth?limit=4&symbol=" + coins.symbol+"USDT",
                method: 'GET',
                success: function (data) {
                    if (data.asks.length === 0 || data.bids.length === 0) {
                        callback(null, null);  // Indicate success with no data
                        selesaiProsesAnggota();
                        toastr.error('GAGAL DAPATKAN HARGA TOKEN ' + coins.symbol + ' !!');
                    } else {        
                        var dataOUT = {};
        
                        // Mengambil harga dan volume untuk bids (buy orders)
                        dataOUT.price_sell = data.bids[0][0];
                        dataOUT.price_sell1 = data.bids[1] ? data.bids[1][0] : null;
                        dataOUT.price_sell2 = data.bids[2] ? data.bids[2][0] : null;
                        dataOUT.price_sell3 = data.bids[3] ? data.bids[3][0] : null;
                        dataOUT.vol_sell = (parseFloat(data.bids[0][1]) * dataOUT.price_sell).toFixed(2);
                        dataOUT.vol_sell1 = (data.bids[1] ? (parseFloat(data.bids[1][1]) * dataOUT.price_sell1).toFixed(2) : null);
                        dataOUT.vol_sell2 = (data.bids[2] ? (parseFloat(data.bids[2][1]) * dataOUT.price_sell2).toFixed(2) : null);
                        dataOUT.vol_sell3 = (data.bids[3] ? (parseFloat(data.bids[3][1]) * dataOUT.price_sell3).toFixed(2) : null);
        
                        // Mengambil harga dan volume untuk asks (sell orders)
                        dataOUT.price_buy = data.asks[0][0];
                        dataOUT.price_buy1 = data.asks[1] ? data.asks[1][0] : null;
                        dataOUT.price_buy2 = data.asks[2] ? data.asks[2][0] : null;
                        dataOUT.price_buy3 = data.asks[3] ? data.asks[3][0] : null;
                        dataOUT.vol_buy = (parseFloat(data.asks[0][1]) * dataOUT.price_buy).toFixed(2);
                        dataOUT.vol_buy1 = (data.asks[1] ? (parseFloat(data.asks[1][1]) * dataOUT.price_buy1).toFixed(2) : null);
                        dataOUT.vol_buy2 = (data.asks[2] ? (parseFloat(data.asks[2][1]) * dataOUT.price_buy2).toFixed(2) : null);
                        dataOUT.vol_buy3 = (data.asks[3] ? (parseFloat(data.asks[3][1]) * dataOUT.price_buy3).toFixed(2) : null);
        
                    //  dataOUT.symbol = GantiSymbol(coins.symbol, "USDT", "");
                        dataOUT.symbol = coins.symbol;
                        dataOUT.modal = modal;
                        dataOUT.amount_in_sell = modal / data.bids[0][0]; // Sesuaikan di sini
                        dataOUT.amount_in_buy = modal / parseFloat(prices.PriceRateSell);
                        dataOUT.PriceRateBuy = parseFloat(prices.PriceRateBuy);
                        dataOUT.PriceRateSell = parseFloat(prices.PriceRateSell);
                        dataOUT.feeWD = withdrawFee * data.bids[0][0]; // Sesuaikan di sini
                        
                        $("#vol1_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>");
                        $("#vol2_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>");
                        $("#vol1_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>");
                        $("#vol2_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>");
                        
                        callback(null, dataOUT);
                    }
                },
                error: function (error) {
                    callback(null, null);  // Indicate success with no data
                    toastr.error('KONEKSI BINANCE GAGAL TOKEN ' + coins.symbol + ' !!');
                    selesaiProsesAnggota();
                }
            });
        });
    }

    // Fungsi untuk mengecek harga pada KUCOIN
    function getPriceKUCOIN(coins, modal, index,cex, callback) {
        var ISERVERCORS = parseInt(getFromLocalStorage('SERVERCORS'));
        const ListfeeWD = getFromLocalStorage("FEEWD_KUCOIN");
    
        if (ListfeeWD === null) {
            toastr.error("UPDATE FEE WD KUCOIN DAHULU!<br/>");
        }
        
        // Mencari koin yang sesuai dengan parameter coin
        const selectedCoin = ListfeeWD.find(function (item) {
            return item.coin === coins.symbol;
        });
    
        var withdrawFee = 0; // Default value
        if (selectedCoin) {
            withdrawFee = selectedCoin.feeWDs;
        }

        // Mendapatkan harga pair terlebih dahulu sebelum memproses harga dari Gate.io
        getPricePAIR(coins.pairdex, function(prices) {
            $.ajax({
                url : "https://proxykiri.awokawok.workers.dev/?https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=" +coins.symbol+"-USDT",
                method: 'GET',
                success: function (data) {
                    if (data.data.asks.length === 0 || data.data.bids.length === 0) {
                        callback(null, null);  // Indicate success with no data
                        selesaiProsesAnggota();
                        toastr.error('KUCOIN : GAGAL DAPATKAN HARGA TOKEN ' + coins.symbol + ' !!');
                    } else {
        
                        var dataOUT = {};
        
                        // Mengambil harga dan volume untuk bids (buy orders)
                        dataOUT.price_sell = data.data.bids[0][0];
                        dataOUT.price_sell1 = data.data.bids[1] ? data.data.bids[1][0] : null;
                        dataOUT.price_sell2 = data.data.bids[2] ? data.data.bids[2][0] : null;
                        dataOUT.price_sell3 = data.data.bids[3] ? data.data.bids[3][0] : null;
                        dataOUT.vol_sell = (parseFloat(data.data.bids[0][1]) * dataOUT.price_sell).toFixed(2);
                        dataOUT.vol_sell1 = (data.data.bids[1] ? (parseFloat(data.data.bids[1][1]) * dataOUT.price_sell1).toFixed(2) : null);
                        dataOUT.vol_sell2 = (data.data.bids[2] ? (parseFloat(data.data.bids[2][1]) * dataOUT.price_sell2).toFixed(2) : null);
                        dataOUT.vol_sell3 = (data.data.bids[3] ? (parseFloat(data.data.bids[3][1]) * dataOUT.price_sell3).toFixed(2) : null);
        
                        // Mengambil harga dan volume untuk asks (sell orders)
                        dataOUT.price_buy = data.data.asks[0][0];
                        dataOUT.price_buy1 = data.data.asks[1] ? data.data.asks[1][0] : null;
                        dataOUT.price_buy2 = data.data.asks[2] ? data.data.asks[2][0] : null;
                        dataOUT.price_buy3 = data.data.asks[3] ? data.data.asks[3][0] : null;
                        dataOUT.vol_buy = (parseFloat(data.data.asks[0][1]) * dataOUT.price_buy).toFixed(2);
                        dataOUT.vol_buy1 = (data.data.asks[1] ? (parseFloat(data.data.asks[1][1]) * dataOUT.price_buy1).toFixed(2) : null);
                        dataOUT.vol_buy2 = (data.data.asks[2] ? (parseFloat(data.data.asks[2][1]) * dataOUT.price_buy2).toFixed(2) : null);
                        dataOUT.vol_buy3 = (data.data.asks[3] ? (parseFloat(data.data.asks[3][1]) * dataOUT.price_buy3).toFixed(2) : null);
        
                        dataOUT.symbol = coins.symbol;
        
                        dataOUT.modal = modal;
                        dataOUT.amount_in_sell = modal / data.data.bids[0][0]; // Sesuaikan di sini
                        dataOUT.amount_in_buy = modal / parseFloat(prices.PriceRateSell);
                        dataOUT.PriceRateBuy = parseFloat(prices.PriceRateBuy);
                        dataOUT.PriceRateSell = parseFloat(prices.PriceRateSell);
                        dataOUT.feeWD = withdrawFee * data.data.bids[0][0]; // Sesuaikan di sini
                        
                        $("#vol1_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>");
                        $("#vol2_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>");
                        $("#vol1_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>");
                        $("#vol2_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>");
                        
                        callback(null, dataOUT);
                    }
                },
                error: function (error) {
                    callback(null, null);  // Indicate success with no data
                    toastr.error('KONEKSI KUCOIN GAGAL TOKEN ' + coins.symbol + ' !!');
                    selesaiProsesAnggota();
                }
            });
        });
    }

    // Fungsi untuk mengecek harga pada BITGET
    function getPriceBITGET(coins, modal, index,cex, callback) {
        var ISERVERCORS = parseInt(getFromLocalStorage('SERVERCORS'));
        const ListfeeWD = getFromLocalStorage("FEEWD_BITGET");
    
        if (ListfeeWD === null) {
            toastr.error("REFRESH & UPDATE FEE WD DAHULU!<br/>");
        }
    
        // Mencari koin yang sesuai dengan parameter coin
        const selectedCoin = ListfeeWD.find(function (item) {
            return item.coin === coins.symbol;
        });
    
        var withdrawFee = 0; // Default value
        if (selectedCoin) {
            withdrawFee = selectedCoin.feeWDs;
        }

        getPricePAIR(coins.pairdex, function(prices) {
            $.ajax({
                url: 'https://api.bitget.com/api/v2/spot/market/orderbook?symbol=' +coins.symbol+'USDT',
                method: 'GET',
                success: function (response) {
                    if (response.data.asks.length === 0 || response.data.bids.length === 0) {
                        callback(null, null);  // Indicate success with no data
                        selesaiProsesAnggota();
                        toastr.error('GAGAL DAPATKAN HARGA TOKEN ' + coins.symbol + ' !!');
                    } else {
        
                        var dataOUT = {};
                        dataOUT.price_buy = response.data.asks[0][0];
                        dataOUT.price_buy1 = response.data.asks[1][0];
                        dataOUT.price_buy2 = response.data.asks[2][0];
                        dataOUT.price_buy3 = response.data.asks[3][0];
                        dataOUT.vol_buy = (parseFloat(response.data.asks[0][1]) * dataOUT.price_buy).toFixed(2);
                        dataOUT.vol_buy1 = (parseFloat(response.data.asks[1][1]) * dataOUT.price_buy1).toFixed(2);
                        dataOUT.vol_buy2 = (parseFloat(response.data.asks[2][1]) * dataOUT.price_buy2).toFixed(2);
                        dataOUT.vol_buy3 = (parseFloat(response.data.asks[3][1]) * dataOUT.price_buy3).toFixed(2);

                        dataOUT.price_sell = response.data.bids[0][0];
                        dataOUT.price_sell1 = response.data.bids[1][0];
                        dataOUT.price_sell2 = response.data.bids[2][0];
                        dataOUT.price_sell3 = response.data.bids[3][0];
                        dataOUT.vol_sell = (parseFloat(response.data.bids[0][1]) * dataOUT.price_sell).toFixed(2);
                        dataOUT.vol_sell1 = (parseFloat(response.data.bids[1][1]) * dataOUT.price_sell1).toFixed(2);
                        dataOUT.vol_sell2 = (parseFloat(response.data.bids[2][1]) * dataOUT.price_sell2).toFixed(2);
                        dataOUT.vol_sell3 = (parseFloat(response.data.bids[3][1]) * dataOUT.price_sell3).toFixed(2);

                        dataOUT.symbol = coins.symbol;
        
                        dataOUT.modal = modal;
                        dataOUT.amount_in_sell = modal / response.data.asks[0][0]; // Sesuaikan di sini
                        dataOUT.amount_in_buy = modal / parseFloat(prices.PriceRateSell);
                        dataOUT.PriceRateBuy = parseFloat(prices.PriceRateBuy);
                        dataOUT.PriceRateSell = parseFloat(prices.PriceRateSell);
                        dataOUT.feeWD = withdrawFee * response.data.asks[0][0]; // Sesuaikan di sini
                        
                        $("#vol1_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>");
                        $("#vol2_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>");
                        $("#vol1_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>");
                        $("#vol2_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>");
                        
                        callback(null, dataOUT);
                    }
                },
                error: function (error) {
                    callback(null, null);  // Indicate success with no data
                    toastr.error('KONEKSI BITGET GAGAL TOKEN ' + coins.symbol + ' !!');
                    selesaiProsesAnggota();
                }
            });
        });
    }

    // Fungsi untuk mengecek harga pada BYBIT
    function getPriceBYBIT(coins, modal, index,cex, callback) {
        var ISERVERCORS = parseInt(getFromLocalStorage('SERVERCORS'));
        const ListfeeWD = getFromLocalStorage("FEEWD_BYBIT");
    
        if (ListfeeWD === null) {
            toastr.error("REFRESH & UPDATE FEE WD BYBIT DAHULU!<br/>");
        }
        
        // Mencari koin yang sesuai dengan parameter coin
        const selectedCoin = ListfeeWD.find(function (item) {
            return item.coin === coins.symbol;
        });
    
        var withdrawFee = 0; // Default value
        if (selectedCoin) {
            withdrawFee = selectedCoin.feeWDs;
        }
    
        getPricePAIR(coins.pairdex, function(prices) {
        $.ajax({
            url : "https://api.bybit.com/v5/market/orderbook?category=spot&limit=4&symbol=" +coins.symbol+"USDT",
            method: 'GET',
            success: function (data) {
                if (data.result.a.length === 0 || data.result.b.length === 0) {
                    callback(null, null);  // Indicate success with no data
                    selesaiProsesAnggota();
                    toastr.error('GAGAL DAPATKAN HARGA TOKEN ' + coins.symbol + ' !!');
                } else {    
                    var dataOUT = {};
    
                    // Mengambil harga dan volume untuk bids (buy orders)
                    dataOUT.price_sell = data.result.b[0][0];
                    dataOUT.price_sell1 = data.result.b[1] ? data.result.b[1][0] : null;
                    dataOUT.price_sell2 = data.result.b[2] ? data.result.b[2][0] : null;
                    dataOUT.price_sell3 = data.result.b[3] ? data.result.b[3][0] : null;
                    dataOUT.vol_sell = (parseFloat(data.result.b[0][1]) * dataOUT.price_sell).toFixed(2);
                    dataOUT.vol_sell1 = (data.result.b[1] ? (parseFloat(data.result.b[1][1]) * dataOUT.price_sell1).toFixed(2) : null);
                    dataOUT.vol_sell2 = (data.result.b[2] ? (parseFloat(data.result.b[2][1]) * dataOUT.price_sell2).toFixed(2) : null);
                    dataOUT.vol_sell3 = (data.result.b[3] ? (parseFloat(data.result.b[3][1]) * dataOUT.price_sell3).toFixed(2) : null);
    
                    // Mengambil harga dan volume untuk asks (sell orders)
                    dataOUT.price_buy = data.result.a[0][0];
                    dataOUT.price_buy1 = data.result.a[1] ? data.result.a[1][0] : null;
                    dataOUT.price_buy2 = data.result.a[2] ? data.result.a[2][0] : null;
                    dataOUT.price_buy3 = data.result.a[3] ? data.result.a[3][0] : null;
                    dataOUT.vol_buy = (parseFloat(data.result.a[0][1]) * dataOUT.price_buy).toFixed(2);
                    dataOUT.vol_buy1 = (data.result.a[1] ? (parseFloat(data.result.a[1][1]) * dataOUT.price_buy1).toFixed(2) : null);
                    dataOUT.vol_buy2 = (data.result.a[2] ? (parseFloat(data.result.a[2][1]) * dataOUT.price_buy2).toFixed(2) : null);
                    dataOUT.vol_buy3 = (data.result.a[3] ? (parseFloat(data.result.a[3][1]) * dataOUT.price_buy3).toFixed(2) : null);
    
                    dataOUT.symbol = coins.symbol;
    
                    dataOUT.modal = modal;
                    dataOUT.amount_in_sell = modal / data.result.b[0][0]; // Sesuaikan di sini
                    dataOUT.amount_in_buy = modal / parseFloat(prices.PriceRateSell);
                    dataOUT.PriceRateBuy = parseFloat(prices.PriceRateBuy);
                    dataOUT.PriceRateSell = parseFloat(prices.PriceRateSell);
                    dataOUT.feeWD = withdrawFee * data.result.b[0][0]; // Sesuaikan di sini
                    
                    $("#vol1_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy + " : " + dataOUT.vol_buy + "$ <br/> ~" + dataOUT.price_buy1 + " : " + dataOUT.vol_buy1 + "$</label>");
                    $("#vol2_buy_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-primary'>~" + dataOUT.price_buy2 + " : " + dataOUT.vol_buy2 + "$ <br/> ~" + dataOUT.price_buy3 + " : " + dataOUT.vol_buy3 + "$ </label>");
                    $("#vol1_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell + " : " + dataOUT.vol_sell + "$ <br/> ~" + dataOUT.price_sell1 + " : " + dataOUT.vol_sell1 + "$ </label>");
                    $("#vol2_sell_"+cex+"_" + dataOUT.symbol).html("<label class='uk-text-danger'>~" + dataOUT.price_sell2 + " : " + dataOUT.vol_sell2 + "$  <br/> ~" + dataOUT.price_sell3 + " : " + dataOUT.vol_sell3 + "$ </label>");
                    
                    callback(null, dataOUT);
                }
            },
            error: function (error) {
                callback(null, null);  // Indicate success with no data
                toastr.error('KONEKSI ' + NameCEX.toUpperCase() + ' GAGAL TOKEN ' + coins.symbol + ' !!');
                selesaiProsesAnggota();
            }
        });
        });
    }

    // Fungsi untuk mengecek harga pada DEX
    function getPriceDEX(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS, PriceRate, dexType,cex,pairdex) {
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
        var amount_in = BigInt(Math.round(Math.pow(10, des_input) * amount));
        var NameToken = symbol;
        var ISERVERCORS = parseInt(getFromLocalStorage('DATA_SERVERCORS', 0)); // Menggunakan getFromLocalStorage
        var ServerCORS = (action === "sell") ? (parseInt(ServerCORS) + parseInt(groupSize)) : ServerCORS;
        var selectedServer = SavedSettingData.SERVERCORS[ISERVERCORS][Math.floor(Math.random() * SavedSettingData.SERVERCORS[ISERVERCORS].length)];
        
        var IdCellTableDEX = GetIdCellDEX(action, posisi, NameToken,cex);
        var IdCellTableCEX = GetIdCellCEX(action, posisi, NameToken,cex);
    
        if (!IdCellTableDEX || !IdCellTableCEX) {
            toastr.error("GAGAL UPDATE TABEL HARGA");
        }
    
        var apiUrl, requestData;
        var link = {
            'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'swoop': "https://app.swoop.exchange"
        }[dexType];
        
        switch (dexType) {
            case 'kyberswap':
                apiUrl = "https://aggregator-api.kyberswap.com/" + DTChain.Nama_Chain + "/route/encode?tokenIn=" + sc_input + "&tokenOut=" + sc_output + "&amountIn=" + amount_in + "&to=0x2315FAa4CE7A4cEA50Ae9DEC252Be620c6e454ca&saveGas=0&gasInclude=1&slippageTolerance=1&clientData={%22source%22:%22DefiLlama%22}";
                break;
            case 'paraswap':
                apiUrl = "https://api.paraswap.io/prices?" + "srcToken=" + sc_input + "&srcDecimals=" + des_input + "&destToken=" + sc_output + "&destDecimals=" + des_output + "&side=SELL&network=" + DTChain.Kode_Chain + "&amount=" + amount_in + "&version=6.2";
                break;
            case 'odos':
                apiUrl = selectedServer+"https://api.odos.xyz/sor/quote/v2";
                requestData = {
                    chainId: DTChain.Kode_Chain,
                    inputTokens: [{ amount: amount_in.toString(), tokenAddress: sc_input }],
                    outputTokens: [{ proportion: 1, tokenAddress: sc_output }],
                    referralCode: 0,
                    slippageLimitPercent: 0.3,
                };
                break;
            case '0x':
                    if (DTChain.Nama_Chain.toLowerCase() === 'ethereum') {
                        // Endpoint untuk 0x tanpa DTChain.Nama_Chain
                        apiUrl = "https://api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    } else {
                        // Endpoint untuk 0x dengan DTChain.Nama_Chain
                        apiUrl = "https://" + DTChain.Nama_Chain + ".api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    }
                    break;
            case '1inch':
                apiUrl = "https://api-defillama.1inch.io/v5.2/" + DTChain.Kode_Chain + "/quote?src=" + sc_input + "&dst=" + sc_output + "&amount=" + amount_in + "&includeGas=true";
                break;
            case 'swoop':
                requestData = {
                    "chainId": DTChain.Kode_Chain,
                    "aggregatorSlug": "swoop",
                    "sender": SavedSettingData.walletMETA,
                    "inToken": {
                        "chainId": DTChain.Kode_Chain,
                        "type": "TOKEN",
                        "address": sc_input,
                        "decimals": parseFloat(des_input)
                    },
                    "outToken": {
                        "chainId": DTChain.Kode_Chain,
                        "type": "TOKEN",
                        "address": sc_output,
                        "decimals": parseFloat(des_output)
                    },
                    "amountInWei": String(amount_in),
                    "slippageBps": "100",
                    "gasPriceGwei": Number(getFromLocalStorage('gasGWEI', 0)), // Menggunakan getFromLocalStorage
                };
                apiUrl = 'https://swoop-backend.up.railway.app/swap';
                break;
            default:
                console.error("Unsupported DEX type");
                return;
        }
    
        $.ajax({
            url: apiUrl,
            method: dexType === 'odos' || dexType === 'swoop' ? 'POST' : 'GET',
            contentType: dexType === 'odos' || dexType === 'swoop' ? 'application/json' : undefined,
            data: dexType === 'odos' ? JSON.stringify(requestData) : (dexType === 'swoop' ? JSON.stringify(requestData) : undefined),
            timeout: parseInt(getFromLocalStorage('waktuTunggu', 0)) * 1000, // Menggunakan getFromLocalStorage
            headers: dexType === '0x' ? {
                '0x-api-key': "6f5d5c4d-bfdd-4fc7-8d3f-d3137094feb5",
            } : undefined,
            beforeSend: function () {
                var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp; ' + dexType.toUpperCase() + '</div>';
                IdCellTableDEX.html(loadingSpinner);
            },
    
            success: function (response, textStatus, xhr) {
                setTimeout(function () {
                    if (xhr.status === 200) {
                        if (!response || (typeof response !== 'object')) {
                            var errorMsg = "NO RESPONSE";
                            IdCellTableDEX.html("<a href=# title='" + errorMsg + "' class='error'><i class=bi bi-exclamation-circle></i> GAGAL</a>");
                            return;
                        }
    
                        if (response.error) {                                
                            IdCellTableDEX.html("<a href=# title='" + response.error + "' class='error'><i class=bi bi-exclamation-circle></i> KODE: " + response.error + "</a>");
                            return;
                        }
    
                        var amount_out, FeeSwap;
    
                        switch (dexType) {
                            case 'kyberswap':
                                amount_out = response.outputAmount / Math.pow(10, des_output);
                                FeeSwap = ((response.totalGas / Math.pow(10, 9)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case 'paraswap':
                                amount_out = response.priceRoute.destAmount / Math.pow(10, des_output);
                                FeeSwap = parseFloat(response.priceRoute.gasCostUSD);
                                break;
                            case 'odos':
                                if (action === "sell") {
                                    amount_out = response.outValues / PriceRate; 
                                } else if (action === "buy") {
                                    amount_out = parseFloat(response.outAmounts) / Math.pow(10, des_output);
                                }                               
                                FeeSwap = response.gasEstimateValue;
                                break;
                            case '0x':
                                amount_out = response.buyAmount / Math.pow(10, des_output);
                                FeeSwap = ((response.estimatedGas / Math.pow(10, 9)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case '1inch':
                                amount_out = parseFloat(response.toAmount) / Math.pow(10, des_output);
                                FeeSwap = ((response.gas / Math.pow(10, 9) * parseFloat(getFromLocalStorage('gasGWEI', 0)))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case 'swoop':
                                amount_out = parseFloat(response.amountOutWei) / Math.pow(10, des_output);
                                FeeSwap = ((response.feeWei / Math.pow(10, des_output)) * parseFloat(getFromLocalStorage('gasGWEI', 0))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                        }
    
                        var selisihPersen, priceDEX, PNL;
    
                        if (action === "sell") {
                            var totalFee = parseFloat(modal * 0.001) + parseFloat(wd) + parseFloat(FeeSwap);
    
                            PNL = parseFloat(amount_out * PriceRate - modal);
                            priceDEX = ((Number(modal) + PNL) / (modal / price)).toFixed(8);
                            selisihPersen = ((priceDEX - price) / price) * 100;
    
                            EntryTableCEX(action, "sell_" + dexType, cex, symbol, NameToken, price, wd, FeeSwap, totalFee);

                            LogEksekusi(dexType.toUpperCase(), "KIRI", NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee, wd, selisihPersen,cex,sc_input, des_input, sc_output, des_output);
                        } else if (action === "buy") {
                            var totalFee = parseFloat(modal * 0.001) + parseFloat(FeeSwap);
    
                            priceDEX = parseFloat(modal / amount_out).toFixed(9);
                            PNL = parseFloat(((modal / priceDEX) * price) - modal);
                            selisihPersen = ((price - priceDEX) / priceDEX) * 100;
    
                            EntryTableCEX(action, "buy_" + dexType,cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            LogEksekusi(dexType.toUpperCase(), "KANAN", NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee, wd, selisihPersen,cex,sc_input, des_input, sc_output, des_output);
                        }
    
                        var filterPNLValue = SavedModalData.FilterPNL == 0 ? totalFee + (modal * 0.1 / 100) : parseFloat(SavedModalData.FilterPNL);
                        var warna, PNLDisplay;
    
                        if (PNL > (filterPNLValue)) {
                            if (action === "sell") {
                                InfoSinyal('Kiri', 'sell', "sell_" + dexType, dexType.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dexType.toUpperCase(), 'KIRI', NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);
                            } else if (action === "buy") {
                                InfoSinyal('Kanan', 'buy', "buy_" + dexType, dexType.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dexType.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);                                   
                            }    
                            warna = "ijo"; 
                        } else {
                            warna = ""; 
                        }
    
                        PNLDisplay = "<span class='uk-text-warning'>PNL:</span>" + PNL.toFixed(2) + "#<span class='uk-label " + (warna === "ijo" ? "uk-label-success" : "uk-label-danger") + "'>" + (PNL - totalFee).toFixed(2) + "</span>";
    
                        if (action === "sell") {
                            IdCellTableDEX.html("<a href='" + link + "' target='_blank'><label class=uk-text-danger>" + priceDEX + " </label></a><br/>" + PNLDisplay).addClass(warna);
                        } else if (action === "buy") {
                            IdCellTableDEX.html("<a href='" + link + "' target='_blank'><label class=uk-text-primary>" + priceDEX + " </label></a><br/>" + PNLDisplay).addClass(warna);
                        }
                        IdCellTableCEX.addClass(warna);
                    }
                }, 0);
            },
            
            error: function (xhr, status, error) {
                var alertMessage = "Terjadi kesalahan";
                var warna = "merah";
    
                switch (xhr.status) {
                    case 0:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alertMessage = errorResponse.detail || errorResponse.description || "SERING SCAN";
                        } catch (e) {
                            warna = "limit";                           
                           // console.warn("SWOOP ERROR!! "+dexType.toUpperCase()+" PINDAH KE SERVER2!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());                        
                            getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS , PriceRate, dexType, cex, pairdex);
                        }
                        break;
                    case 400:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alertMessage = errorResponse.detail || errorResponse.description || "KONEKSI BURUK";
                        } catch (e) {
                            alertMessage = "KONEKSI LAMBAT"; // Jika parsing gagal
                        }
                        break;
                    case 403:
                        alertMessage = "AKSES DIBLOK";
                        break;
                    case 404:
                        alertMessage = "Permintaan tidak ditemukan";
                        break ;
                    case 429:
                        warna = "limit";
                       // console.warn("KENA LIMIT "+dexType.toUpperCase()+" PINDAH KE SERVER2!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());
                        getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS , PriceRate, dexType, cex, pairdex);
                        break;
                    case 500:
                        alertMessage = "GAGAL DAPATKAN DATA";
                        break;
                    case 503:
                        alertMessage = "Layanan tidak tersedia";
                        break;
                    case 502:
                        alertMessage = "Respons tidak valid";
                        break;
                    default:
                        alertMessage = "Status: " + xhr.status;
                }
    
                // Update the UI with the error message
                IdCellTableDEX.html(`<a href="${link}" title="${dexType.toUpperCase()} : ${alertMessage}" target="_blank"> <i class="bi bi-exclamation-circle"></i> ERROR </a>`).addClass(warna);
                IdCellTableCEX.addClass(warna);
            }, 
           
            complete: function () {
                selesaiProsesAnggota();
            }
        });
    }
    // Fungsi untuk mengecek harga pada SERVER2
    function getPriceSWOOP(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS, PriceRate, dex,cex,pairdex) {
        var amount_in = Math.pow(10, des_input) * amount;
        var amount_in = BigInt(Math.round(Number(amount_in)));
    
        var NameToken = symbol;
    
        var IdCellTableDEX = GetIdCellDEX(action, posisi, NameToken,cex);
        var IdCellTableCEX = GetIdCellCEX(action, posisi, NameToken,cex);
    
        if (!IdCellTableDEX || !IdCellTableCEX) {
            toastr.error("GAGAL UPDATE TABEL HARGA");
        }
    
        var dexURL = {
            'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'swoop': "https://app.swoop.exchange"
        }[dex] || "https://app.swoop.exchange";
    
        // Mengambil data setting dari localStorage
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
    
        var payload = {
            "chainId": DTChain.Kode_Chain,
            "aggregatorSlug": dex,
            "sender": SavedSettingData.walletMETA,
            "inToken": {
                "chainId": DTChain.Kode_Chain,
                "type": "TOKEN",
                "address": sc_input,
                "decimals": parseFloat(des_input)
            },
            "outToken": {
                "chainId": DTChain.Kode_Chain,
                "type": "TOKEN",
                "address": sc_output,
                "decimals": parseFloat(des_output)
            },
            "amountInWei": String(amount_in),
            "slippageBps": "100",
            // Mengambil gasGWEI dari localStorage
            "gasPriceGwei": Number(getFromLocalStorage('gasGWEI', 0)),
        };
    
        $.ajax({
            url: 'https://swoop-backend.up.railway.app/swap',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            // Mengambil waktuTunggu dari localStorage dan mengonversinya ke milidetik
            timeout: parseInt(SavedSettingData.waktuTunggu || 30) * 1000,
            beforeSend: function () {
                var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp; SERVER2</div>';
                if (action === "sell") {
                    $("#" + posisi + "_buy_"+cex+"_" + NameToken).empty().html(loadingSpinner);
                } else if (action === "buy") {
                    $("#sell_"+cex+"_" + posisi + "_" + NameToken).empty().html(loadingSpinner);
                }
            },
            success: function (response, textStatus, xhr) {
                setTimeout(function () {
                    if (xhr.status === 200 && !response || xhr.status === 0) {
                        var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp;' + dexType.toUpperCase() + '</div>';
                        IdCellTableDEX.html(loadingSpinner);
                    } else {
                        var amount_out = parseFloat(response.amountOutWei) / Math.pow(10, des_output);
                        var FeeSwap, PNL, priceDEX, totalFee, selisihPersen;
    
                        // Inisialisasi priceDEX
                        //  const gasFeeInToken = (parseFloat(getFromLocalStorage('gasGWEI')) * 40000) / Math.pow(10, 9);
                        //  const gasFeeInUSDT = gasFeeInToken * tokenPriceInUSDT; 
                        priceDEX = '';
                        var FeeSwap = ((parseFloat(getFromLocalStorage('gasGWEI')) * 250000) / Math.pow(10, 9))*parseFloat(getFromLocalStorage('PriceGAS'));
                       
                        if (action === "sell") {
                            PNL = parseFloat((amount_out * PriceRate) - modal);
                            priceDEX = ((Number(modal) + PNL) / (modal / price)).toFixed(9);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(wd) + parseFloat(FeeSwap);
                            selisihPersen = ((priceDEX - price) / price) * 100;
                            // console.warn("KIRI TOKEN "+NameToken+" FEESWAP : "+response.feeWei);
                            // console.warn("PRICE RATE "+PriceRate+" FEESWAP : "+FeeSwap);
                            // console.warn("GAS : "+getFromLocalStorage('gasGWEI'));
                            // console.warn("PRICE GAS : "+parseFloat(getFromLocalStorage('PriceGAS')));
                            // console.warn("FEE GAS ($) : "+FeeSwap2);
                            EntryTableCEX(action, "sell_" + dex, cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            console.warn("### ALIHAN SERVER1 DEX "+dex.toUpperCase()+" KE SERVER2!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());
                            LogEksekusi(dex.toUpperCase(), "KIRI-SWOOP", NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee, wd, selisihPersen, cex, sc_input, des_input, sc_output, des_output);
                        }

                        if (action === "buy") {
                            priceDEX = parseFloat(modal / amount_out).toFixed(9);
                            PNL = parseFloat(((modal / priceDEX) * price) - modal);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(FeeSwap);
                            selisihPersen = ((price - priceDEX) / priceDEX) * 100;
                            //  console.warn("KANAN TOKEN "+NameToken+" FEESWAP : "+response.feeWei);
                            // // console.warn("PRICE RATE "+PriceRate+" FEESWAP : "+FeeSwap);
                            // // console.warn("GAS : "+getFromLocalStorage('gasGWEI'));
                            // // console.warn("PRICE GAS : "+parseFloat(getFromLocalStorage('PriceGAS')));
                            //  console.warn("FEE GAS ($) : "+FeeSwap2);
                            //  console.warn("#PRICE ($) : "+price);
                            //  console.warn("DES : "+des_input);

                            EntryTableCEX(action, "buy_" + dex, cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            console.warn("### ALIHAN SERVER1 DEX "+dex.toUpperCase()+" KE SERVER2!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());
                            LogEksekusi(dex.toUpperCase(), "KANAN-SWOOP", NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee, wd, selisihPersen, cex, sc_input, des_input, sc_output, des_output);
                        }

                        var filterPNLValue = SavedModalData.FilterPNL == 0 ? totalFee + (modal * 0.1 / 100) : parseFloat(SavedModalData.FilterPNL);

                        if (PNL > (filterPNLValue)) {
    
                            if (action === "sell") {
                                InfoSinyal('Kiri', 'sell', "sell_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dex.toUpperCase(), 'KIRI', NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);
                            } else if (action === "buy") {
                                InfoSinyal('Kanan', 'buy', "buy_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dex.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);
                            }
                            var warna = "ijo";
                        } else {
                            var warna = "";
                        }
    
                        PNLDisplay = "<span class='uk-text-warning'>PNL:</span>" + PNL.toFixed(2) + "#<span class='uk-label " + (warna === "ijo" ? "uk-label-success" : "uk-label-danger") + "'>" + (PNL - totalFee).toFixed(2) + "</span>";
    
                        IdCellTableDEX.html("<a href='" + dexURL + "' target='_blank'>" + priceDEX + "</a><br/>" + PNLDisplay).addClass("limit");
                        IdCellTableCEX.addClass("limit");
                    }
                }, 0);
            },
            error: function (xhr, status, error) {
                var warna = "merah";
                var alert;
    
                // Menetapkan pesan alert berdasarkan status
                switch (xhr.status) {
                    case 0:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alert = errorResponse.detail || errorResponse.description || "KESERINGAN SCAN";
                        } catch (e) {
                            warna="limit2";
                            alert = "SERING SCAN";
                            
                           // console.warn("SWOOP ERROR!! SERVER2 DEX "+dex.toUpperCase()+" PINDAH KE SERVER3!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());
                            getPriceRANGO(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS , PriceRate, dex, cex, pairdex);
                        }
                        break;
                    case 400:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            alert = errorResponse.detail || errorResponse.description || "KONEKSI LAMBAT";
                        } catch (e) {
                            alert = "KONEKSI BURUK";
                        }
                        break;
                    case 403:
                        alert = "AKSES DIBLOK";
                        break;
                    case 404:
                        alert = "Permintaan tidak ditemukan";
                        break;
                    case 429:
                        warna="limit2";
                        alert = "KENA LIMIT";
                       // console.warn("SWOOP LIMIT!! SERVER2 DEX "+dex.toUpperCase()+" PINDAH KE SERVER3!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());
                        getPriceRANGO(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS , PriceRate, dex, cex, pairdex);
                        break;
                    case 500:
                        warna="merah";
                        alert = xhr.responseJSON?.message || "GAGAL DAPATKAN DATA";
                        break;
                    case 503:
                        alert = "Layanan tidak tersedia";
                        break;
                    default:
                        alert = "Status: " + xhr.status;

                }
                
                    // Update konten HTML dan atur class dengan logika penggantian eksplisit
                    IdCellTableDEX
                        .html(`<a href="${dexURL}" title="SERVER2 : ${alert}" target='_blank'><i class="bi bi-exclamation-diamonde"></i> ERROR </a>`)
                        .removeClass("limit merah")  // Pastikan hanya ada satu class yang aktif
                        .addClass(warna);             // Tambahkan class yang sesuai, entah "limit" atau "merah"

                    IdCellTableCEX
                        .removeClass("limit merah")
                        .addClass(warna);
            },
        });
    }
    // Fungsi untuk mengecek harga pada SERVER3
    function getPriceRANGO(modal, sc_input, des_input, sc_output, des_output, amount, price, action, symbol, posisi, wd, ServerCORS, PriceRate, dex,cex,pairdex) {
        var amount_in = Math.pow(10, des_input) * amount;
        var amount_in = BigInt(Math.round(Number(amount_in)));
    
        var NameToken = symbol;
    
        var IdCellTableDEX = GetIdCellDEX(action, posisi, NameToken,cex);
        var IdCellTableCEX = GetIdCellCEX(action, posisi, NameToken,cex);
    
        if (!IdCellTableDEX || !IdCellTableCEX) {
            toastr.error("GAGAL UPDATE TABEL HARGA");
        }
            // Membuat variabel baru untuk menyimpan hasil transformasi DTChain.Nama_Chain
        let transformedChain = DTChain.Nama_Chain.toUpperCase() === "ETHEREUM" ? "ETH" : DTChain.Nama_Chain.toUpperCase();

        var dexURL = {
            'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'swoop': "https://app.swoop.exchange"
        }[dex] || "https://app.swoop.exchange";
    
        // Mengambil data setting dari localStorage
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
    
        $.ajax({
            url :"https://api.rango.exchange/basic/quote?from="+transformedChain.toUpperCase()+"--"+sc_input+"&to="+transformedChain.toUpperCase()+"--"+sc_output+"&slippage=0.3&amount="+amount_in+"&apiKey=c6381a79-2817-4602-83bf-6a641a409e32",
            type: 'GET',
            contentType: 'application/json',
            // Mengambil waktuTunggu dari localStorage dan mengonversinya ke milidetik
            timeout: parseInt(SavedSettingData.waktuTunggu || 30) * 1000,
            beforeSend: function () {
                var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp;SERVER3</div>';
                if (action === "sell") {
                    $("#" + posisi + "_buy_"+cex+"_" + NameToken).empty().html(loadingSpinner);
                } else if (action === "buy") {
                    $("#sell_"+cex+"_" + posisi + "_" + NameToken).empty().html(loadingSpinner);
                }
            },
            success: function (response, textStatus, xhr) {
                setTimeout(function () {
                    if (xhr.status === 200 && !response || xhr.status === 0) {
                        var loadingSpinner = '<i class="bi bi-arrow-clockwise"></i>&nbsp;' + dexType.toUpperCase() + '</div>';
                        IdCellTableDEX.html(loadingSpinner);
                    } else {
                        var amount_out = parseFloat(response.route.outputAmount/Math.pow(10, des_output));
                        var FeeSwap, PNL, priceDEX, totalFee, selisihPersen;
    
                        priceDEX = '';
                        var FeeSwap = ((parseFloat(getFromLocalStorage('gasGWEI')) * 250000) / Math.pow(10, 9))*parseFloat(getFromLocalStorage('PriceGAS'));
                        
                        if (action === "sell") {
                            PNL = parseFloat((amount_out * PriceRate) - modal);
                            priceDEX = ((Number(modal) + PNL) / (modal / price)).toFixed(9);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(wd) + parseFloat(FeeSwap);
                            selisihPersen = ((priceDEX - price) / price) * 100;
 
                            EntryTableCEX(action, "sell_" + dex, cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            console.warn("### ALIHAN SERVER2 DEX "+dex.toUpperCase()+" KE SERVER3!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());

                            LogEksekusi(dex.toUpperCase(), "KIRI-RANGO", NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee, wd, selisihPersen, cex, sc_input, des_input, sc_output, des_output);
                        }

                        if (action === "buy") {
                            priceDEX = parseFloat(modal / amount_out).toFixed(9);
                            PNL = parseFloat(((modal / priceDEX) * price) - modal);
                            totalFee = parseFloat(modal * 0.001) + parseFloat(FeeSwap);
                            selisihPersen = ((price - priceDEX) / priceDEX) * 100;

                            EntryTableCEX(action, "buy_" + dex, cex, symbol, NameToken, price, wd, FeeSwap, totalFee);
                            console.warn("### ALIHAN SERVER2 DEX "+dex.toUpperCase()+" KE SERVER3!! TOKEN: "+symbol+" CEX :"+cex.toUpperCase());

                            LogEksekusi(dex.toUpperCase(), "KANAN-RANGO", NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee, wd, selisihPersen, cex, sc_input, des_input, sc_output, des_output);
                        }

                        var filterPNLValue = SavedModalData.FilterPNL == 0 ? totalFee + (modal * 0.1 / 100) : parseFloat(SavedModalData.FilterPNL);

                        if (PNL > (filterPNLValue)) {
    
                            if (action === "sell") {
                                InfoSinyal('Kiri', 'sell', "sell_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dex.toUpperCase(), 'KIRI', NameToken, modal, PNL, price, priceDEX, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);
                            } else if (action === "buy") {
                                InfoSinyal('Kanan', 'buy', "buy_" + cex, cex.toUpperCase(), NameToken, PNL, totalFee, cex);
                                MultisendMessage(cex, dex.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, price, FeeSwap, totalFee,wd, sc_input, NameToken, sc_output, pairdex);
                            }
                            var warna = "ijo";
                        } else {
                            var warna = "";
                        }
    
                        PNLDisplay = "<span class='uk-text-warning'>PNL:</span>" + PNL.toFixed(2) + "#<span class='uk-label " + (warna === "ijo" ? "uk-label-success" : "uk-label-danger") + "'>" + (PNL - totalFee).toFixed(2) + "</span>";
    
                        IdCellTableDEX.html("<a href='" + dexURL + "' target='_blank'>" + priceDEX + "</a><br/>" + PNLDisplay).addClass("limit2");
                        IdCellTableCEX.addClass("limit2");
                    }
                }, 0);
            },
            error: function (xhr, status, error) {
                var warna = "merah";
                var alert;
            
                // Periksa apakah respons berupa JSON dan memiliki `resultType`
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
            
                        if (response.resultType === "NO_ROUTE") {
                            alert = "Rute tidak ditemukan";
                            warna = "orange"; // Bisa atur warna sesuai kondisi NO_ROUTE
                        } else if (response.error || response.errorCode) {
                            alert = response.error || "Terjadi kesalahan pada permintaan";
                        } else {
                            alert = "Respons tidak diketahui";
                        }
                    } catch (e) {
                        alert = "Format respons tidak sesuai";
                    }
                } else {
                    // Menetapkan pesan alert berdasarkan status HTTP
                    switch (xhr.status) {
                        case 0:
                            try {
                                var errorResponse = JSON.parse(xhr.responseText);
                                alert = errorResponse.detail || errorResponse.description || "KESERINGAN SCAN";
                            } catch (e) {
                                alert = "SERING SCAN";
                            }
                            break;
                        case 400:
                            try {
                                var errorResponse = JSON.parse(xhr.responseText);
                                alert = errorResponse.detail || errorResponse.description || "KONEKSI LAMBAT";
                            } catch (e) {
                                alert = "KONEKSI BURUK";
                            }
                            break;
                        case 403:
                            alert = "AKSES DIBLOK";
                            break;
                        case 404:
                            alert = "Permintaan tidak ditemukan";
                            break;
                        case 429:
                            warna = "limit";
                            alert = "KENA LIMIT";
                            break;
                        case 500:
                            alert = xhr.responseJSON?.message || "GAGAL DAPATKAN DATA";
                            break;
                        case 503:
                            alert = "Layanan tidak tersedia";
                            break;
                        default:
                            alert = "Status: " + xhr.status;
                    }
                }
                
                    // Update konten HTML dan atur class dengan logika penggantian eksplisit
                    IdCellTableDEX
                        .html(`<a href="${dexURL}" title="SERVER3 : ${alert}" target='_blank'><i class="bi bi-exclamation-octagon"></i> ERROR </a>`)
                        .removeClass("limit2 merah")  
                        .addClass(warna);             

                    IdCellTableCEX
                        .removeClass("limit2 merah")
                        .addClass(warna);
            },
        });
    }
    
    function countCheckedCEX() {
        let count = 0;
        const checkboxes = ['#D1INCH', '#DODOS', '#D0X', '#DKYBERSWAP', '#DPARASWAP'];
        checkboxes.forEach(checkbox => {
            if ($(checkbox).is(':checked')) {
                count++;
            }
        });
        return count;
    }

    // fungsi UTAMA melakukan simulasi CEX & DEX
    function Scanning(coins, index) {
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
        var cex = coins.cex; // Ambil nilai cex dari coins
        //console.warn("TOKEN : "+coins.symbol+" CEX: "+coins.cex);
    
        var statusChecked = coins.status ? 'checked' : '';
        var NameToken = coins.symbol
        
        var warnaCEX = getWarnaCEX(cex);
        // Menyusun `linkTokenPair` dengan warna yang sesuai
        var linkTokenPair = '<b><label id="PairCEXToken" class="uk-text" style="color:' + warnaCEX + ';">' + cex.toUpperCase() + '-' + coins.pairdex.toUpperCase() + '</label> </b>';
        
        //var linkTokenPair = '<b><label id="PairCEXToken" class="uk-text-primary">' + cex.toUpperCase() + '-' + coins.pairdex.toUpperCase() + '</label> </b>';       
        var linkDefillama = "<span style=color:orange;><a href=https://swap.defillama.com/?chain=" + DTChain.Nama_Chain + "&from=" + coins.sc + "&to=" + SavedSettingData.scAddressPair + " target=_blank>DEFIL</a></span>";
        var linkUNIDEX = "<span style=color:orange;><a href=https://app.unidex.exchange/?chain=" + DTChain.Nama_Chain + "&from=" + coins.sc + "&to=" + SavedSettingData.scAddressPair + " target=_blank>UNIDX</a></span>";

        // Memulai linkStok dengan teks awal
        var linkStok = '<b><label class="uk-text-secondary">STOK : </label></b>';
        // CONFIG_CEX.[cex].chainCEX;
        // Mendapatkan semua wallet dari konfigurasi CONFIG_CEX berdasarkan variabel `cex`
        Object.keys(CONFIG_CEX[cex]).forEach((key, index) => {
            // Cek jika key tersebut adalah "wallet" atau mengandung "wallet" sebagai bagian dari namanya
            if (key.includes('address')) {
                // Menambahkan link untuk setiap wallet ke dalam linkStok
                linkStok += '<b><a href='+DTChain.URL_Chain+'/token/' + coins.sc + '?a=' + CONFIG_CEX[cex][key] + ' target="_blank"> ' + (index + 1) + ' </a></b> | ';
            }
        });

        // Menghapus karakter "|" terakhir dari linkStok untuk membuat tampilannya lebih rapi
        linkStok = linkStok.slice(0, -2);        
          //https://coinmarketcap.com/currencies/bitcoin/#Markets
        $("#TabelHarga").append(
            "<tr>" +
                "<td id=vol1_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_1inch id=buy_" + cex + "_sell_1inch_" + NameToken + "></td>" +
                "<td class=dx_odos id=buy_" + cex + "_sell_odos_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=buy_" + cex + "_sell_kyberswap_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=buy_" + cex + "_sell_paraswap_" + NameToken + "></td>" +
                "<td class='dx_0x' id='buy_" + cex + "_sell_0x_" + NameToken + "'></td>" +
                "<td rowspan='2' style='background-color:#cdcdcd;'>" +                   
                    "<b><span id='wd_"+coins.cex+"_" + NameToken + "'>"+
                    "</span><input type='checkbox' class='statusKoinCheckbox' data-symbol='" + coins.symbol + "' data-cex='" + coins.cex + "' " + statusChecked + "><span style='color:black;'>" + 
                    "<a href='https://coinmarketcap.com/currencies/" + coins.cmcID + "/#Markets' target='_blank'>" + coins.symbol + "</a></span>"+
                    "<span id='dp_"+coins.cex+"_" + NameToken + "'></span></b><br/>"+
                    linkTokenPair+ "<a href='" + DTChain.URL_Chain + "/token/" + coins.sc + "' target='_blank'> [ SC ] </a><br/>"+
                    linkDefillama + " | " + linkUNIDEX +"<br/>"+
                    linkStok + ""+                   
                "</td>" +

                "<td class='dx_1inch' id='sell_" + cex + "_buy_1inch_" + NameToken + "'></td>"+
                "<td class=dx_odos id=sell_" + cex + "_buy_odos_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=sell_" + cex + "_buy_kyberswap_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=sell_" + cex + "_buy_paraswap_" + NameToken + "></td>" +
                "<td class=dx_0x id=sell_" + cex + "_buy_0x_" + NameToken + "></td>" +
                "<td id=vol1_sell_" + cex + "_" + NameToken + "></td>" +
            "</tr>" +
            "<tr>" +
                "<td id=vol2_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_1inch id=sell_1inch_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_odos id=sell_odos_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=sell_kyberswap_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=sell_paraswap_buy_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_0x id=sell_0x_buy_" + cex + "_" + NameToken + "></td>" +

                "<td class=dx_1inch id=buy_1inch_sell_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_odos id=buy_odos_sell_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_kyberswap id=buy_kyberswap_sell_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_paraswap id=buy_paraswap_sell_" + cex + "_" + NameToken + "></td>" +
                "<td class=dx_0x id=buy_0x_sell_" + cex + "_" + NameToken + "></td>" +
                "<td id=vol2_sell_" + cex + "_" + NameToken + "></td>" +
            "</tr>"
        );    

        const dexList = [
            { id: 'D1INCH', withdraw: SavedModalData.ModalKiri1INCH, deposit: SavedModalData.ModalKanan1INCH, dex: '1inch' },
            { id: 'DODOS', withdraw: SavedModalData.ModalKiriODOS, deposit: SavedModalData.ModalKananODOS, dex: 'odos' },
            { id: 'D0X', withdraw: SavedModalData.ModalKiri0X, deposit: SavedModalData.ModalKanan0X, dex: '0x' },
            { id: 'DKYBERSWAP', withdraw: SavedModalData.ModalKiriKYBERSWAP, deposit: SavedModalData.ModalKananKYBERSWAP, dex: 'kyberswap' },
            { id: 'DPARASWAP', withdraw: SavedModalData.ModalKiriPARASWAP, deposit: SavedModalData.ModalKananPARASWAP, dex: 'paraswap' }
        ];

        // Define a mapping for CEXs to their respective functions
        const getPriceCEX = {
            "BINANCE": getPriceBINANCE,
            "GATE": getPriceGATE,
            "KUCOIN": getPriceKUCOIN,
            "BITGET": getPriceBITGET,
            "BYBIT": getPriceBYBIT,
            // "INDODAX": getPriceIndodax
        }[cex];

        const getStatusWalletCEX = {
            "BINANCE": StatusWalletBINANCE,
            "GATE": StatusWalletGATE,
            "KUCOIN": StatusWalletKUCOIN,
            "BITGET": StatusWalletBITGET,
            "BYBIT": StatusWalletBYBIT,
            // "INDODAX": StatusWalletIndodax
        }[cex];

        if (!getPriceCEX || !getStatusWalletCEX) {
            console.error('Unsupported CEX');
            return;
        }

        getStatusWalletCEX(NameToken).then(result => {
            if (result.withdrawActive && $('#ls').is(':checked')) {
                $("span#wd_"+cex+"_" + NameToken + "").html('WD ').addClass("uk-text-primary");
                dexList.forEach(({ id, withdraw, dex }) => {
                    if ($('#' + id).is(':checked')) {
                        // Dapatkan scAddressPair dan desPair berdasarkan coins.pairdex
                        const { scAddressPair, desPair } = DTChain.PAIRDEXS[coins.pairdex] || {};
                        //console.warn("KIRI TOKEN : "+coins.symbol+" CEX: "+coins.cex +" PAIR: "+coins.pairdex);
                        // console.warn("SC OUT : "+scAddressPair+" DES OUT: "+desPair);
                        getPriceCEX(coins, withdraw, index + 1,cex, function (error, result) {                             
                            if (error) {
                                console.error(`Error while fetching price for ${dex}:`, error);
                                $("#buy_"+cex+"_sell_" + dex + "_" + NameToken).text("CEK BUY..").toggleClass('merah');
                                $("#sell_" + dex + "_buy_"+cex+"_" + NameToken).toggleClass('merah');
                            } else if (result) {
                                getPriceDEX(result.modal, coins.sc, coins.desimal, scAddressPair, desPair, result.amount_in_sell, result.price_buy, "sell", coins.symbol, "sell_" + dex, result.feeWD, index, result.PriceRateBuy, dex,cex,coins.pairdex, function (error, response) {});
                            } else {
                                $("#sell_" + dex + "_buy_"+cex+"_" + NameToken).html(`<a href="#" title="'CEX : GAGAL DAPAT HARGA'" target="_blank"> <i class="bi bi-dash-circle"></i> ERROR </a>`).toggleClass("merah");
                                $("#buy_"+cex+"_sell_" + dex + "_" + NameToken).toggleClass('merah');
                                console.warn(`Result is null for ${dex}, ${NameToken} POSISI KIRI.`);
                            }
                        });
                    }
                });
            }

            if (result.depositActive && $('#rs').is(':checked')) {
                $("span#dp_"+cex+"_" + NameToken + "").html(' DP').addClass("uk-text-primary");
                dexList.forEach(({ id, deposit, dex }) => {
                    if ($('#' + id).is(':checked')) {
                        // Dapatkan scAddressPair dan desPair berdasarkan coins.pairdex
                        const { scAddressPair, desPair } = DTChain.PAIRDEXS[coins.pairdex] || {};
                       // console.warn("KANAN TOKEN : "+coins.symbol+" CEX: "+coins.cex +" PAIR: "+coins.pairdex);
                       // console.warn("SC OUT : "+scAddressPair+" DES OUT: "+desPair);
                        getPriceCEX(coins, deposit, index + 1,cex, function (error, result) {
                            if (error) {
                                console.error(`Error while fetching price for ${dex}:`, error);
                                $("#sell_"+cex+"_buy_" + dex + "_" + NameToken).html("CEK BUY..").toggleClass('merah');
                                $("#buy_" + dex + "_sell_"+cex+"_" + NameToken).toggleClass('merah');
                            } else if (result) {
                                getPriceDEX(result.modal, scAddressPair, desPair, coins.sc, coins.desimal, result.amount_in_buy, result.price_sell, "buy", coins.symbol, "buy_" + dex, result.feeWD, index, result.PriceRateSell, dex,cex,coins.pairdex, function (error, response) {});
                            } else {
                                $("#sell_"+cex+"_buy_" + dex + "_" + NameToken).html(`<a href="#" title="'CEX : GAGAL DAPAT HARGA'" target="_blank"> <i class="bi bi-dash-circle"></i> ERROR </a>`).toggleClass("merah");
                                $("#buy_" + dex + "_sell_"+cex+"_" + NameToken).toggleClass('merah');
                                console.warn(`Result is null for ${dex}, ${NameToken} POSISI KANAN.`);
                            }
                        });
                    }
                });
            }

            if (!result.withdrawActive || !result.depositActive) {
                const checkedCountCEX = countCheckedCEX();
                for (let i = 0; i < checkedCountCEX; i++) {
                    const dexes = ['1inch', 'odos', '0x', 'kyberswap', 'paraswap'];
                   // dexes.forEach(dex => {
                        if (!result.withdrawActive) {
                            $("span#wd_"+cex+"_" + NameToken + "").html('WX ').addClass("uk-text-danger");
                            dexes.forEach(dex => {    
                                $("#buy_"+cex+"_sell_" + dex + "_" + NameToken).text("---").addClass('putih');
                                $("#sell_" + dex + "_buy_"+cex+"_" + NameToken).addClass('putih');
                                selesaiProsesAnggota();
                            });
                        }
                        if (!result.depositActive) {
                            $("span#dp_"+cex+"_" + NameToken + "").html(' DX').addClass("uk-text-danger");
                            dexes.forEach(dex => {
                                $("#sell_"+cex+"_buy_" + dex + "_" + NameToken).text("---").addClass('putih');
                                $("#buy_" + dex + "_sell_"+cex+"_" + NameToken).addClass('putih');
                                selesaiProsesAnggota();
                            });
                        }
                   //});
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toastr.error("UPDATE WALLET CEX DAHULU!!!");
        });

        updateTableVisibility();
    }
    // fungsi untuk mengelolah tampilan progress bar
    function updateProgress(totalscanned, token) {
        // Hitung jumlah token yang sudah difilter
        const filteredTokenList = filterTokens().length; // Ambil token yang sudah difilter
        var mulai = parseInt(getFromLocalStorage('startTime', new Date().getTime())); // Default ke waktu sekarang jika tidak ditemukan
        var endTime = new Date().getTime(); // Waktu akhir setelah panggilan REST API berhasil
    
        var duration = (endTime - mulai) / 1000; // Durasi panggilan API dalam detik
        saveToLocalStorage("duration", duration); // Simpan durasi ke localStorage
    
        // Hitung waktu mulai dan berakhir
        var startTimeFormatted = new Date(mulai).toLocaleTimeString(); // Format waktu mulai
        var endTimeFormatted = new Date(endTime).toLocaleTimeString(); // Format waktu akhir
    
        // Menghitung persentase progres
        var perulangan = totalscanned / filteredTokenList;
        $('#scanprogress').html('CHECK - ' + token + ' [ ' + totalscanned + ' / ' + filteredTokenList + '] ::  Mulai: ' + startTimeFormatted + ' ~ DURASI [' + parseFloat(duration / 60).toFixed(2) + ' Menit]').css({
            "color": "blue",
            "text-align": "left"
        });
        $('#bar').css('width', (totalscanned / filteredTokenList * 100) + '%');
    
        // Jika proses scanning selesai
        if (totalscanned >= filteredTokenList) {
            if (autorun == true) {
                $('#scanprogress').html('Mengulangi scanning dalam 7 detik.');
    
                setTimeout(function () {
                    $('tbody tr').remove();
                    var startTime = new Date().getTime();
                    saveToLocalStorage('startTime', startTime); // Simpan waktu mulai baru ke localStorage
    
                    setNullInfo(); // Reset informasi
                    processTokenData(filteredTokenList, groupSize); // Proses data token
                }, 7000);
            } else {
                $('#scanprogress').html('SCANNING SELESAI!! ' + endTimeFormatted + ' ~ DURASI [' + parseFloat(duration / 60).toFixed(2) + ' Menit]').css({
                    "color": "black",
                    "text-align": "right"
                });
                form_on();
                $("button#startSCAN.uk-button.uk-button-primary").show();
                $('#syncDATA, #set-modal, #cek_wallet, a').css('pointer-events', 'auto').css('opacity', '1');
                $("#refresh").hide();
            }
        }
    }
    
    $("#refresh").click(function () {
        location.reload();
        //toastr.success('REFRESH DONE!!');
        alert("REFRESH AKAN DILAKUKAN...!!");
        $("button#startSCAN.uk-button.uk-button-primary").hide();
    });

    function sendStatusTELE(user, status) {
        var users = [
            { chat_id: SavedSettingData.ID_GRUP }
        ];

        var token = SavedSettingData.TOKEN;
        var apiUrl = 'https://api.telegram.org/bot' + token + '/sendMessage';

        // Ambil data dari localStorage dan parse sebagai JSON object
        var data = getFromLocalStorage('ID','');

        var message = " #" + user.toUpperCase() + " is <b>[ " + status + " ]</b>" +
            "\n <b> "+DTChain.Nama_Chain.toUpperCase()+" MULTIMARKET  </b>"+
            "\n <b> ID UNIX : </b>" + data.id +
            "\n <b> PROVIDER : </b> " + data.name +
            "\n <b> IP : </b>" + data.ip+
            "\n ----------------------------------------------";

        // Loop melalui daftar pengguna
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var chatId = user.chat_id; // Ganti dengan ID chat pengguna

            // Membuat permintaan POST menggunakan jQuery
            $.ajax({
            url: apiUrl,
            method: "POST",
            data: {
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: true
            },
            success: function(response) {
                // console.log("Message sent successfully");
            },
            error: function(xhr, status, error) {
                console.log("Error sending message:", error);
            }
            });
        }
        }

    // fungsi untuk mengirim info ke grup telegram
    function MultisendMessage(cex, dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee,feeWD, sc_input, pair_input, sc_output, pair_output) {
        // Mengambil user dari localStorage menggunakan getFromLocalStorage
        var user = getFromLocalStorage('user', 'Unknown User').toUpperCase(); // Gunakan default 'Unknown User' jika tidak ada data
    
        var source = posisi === "KIRI" 
            ? "<b>#" + cex.toUpperCase() + " >> #" + dex.toUpperCase() + "</b>" 
            : posisi === "KANAN" 
            ? "<b>#" + dex.toUpperCase() + " >> #" + cex.toUpperCase() + "</b>" 
            : "<b>Unknown Position</b>";
    
            if (cex.toUpperCase() === "GATE") {
                baseUrlTrade = `https://www.gate.io/trade/${token}_USDT`;
            } else if (cex.toUpperCase() === "BINANCE") {
                baseUrlTrade = `https://www.binance.com/en/trade/${token}_USDT`;
            } else if (cex.toUpperCase() === "KUCOIN") {
                baseUrlTrade = `https://www.kucoin.com/trade/${token}-USDT`;
            } else if (cex.toUpperCase() === "BITGET") { 
                baseUrlTrade = `https://www.bitget.com/spot/${token}USDT`;
            } else if (cex.toUpperCase() === "BYBIT") { 
                baseUrlTrade = `https://www.bybit.com/en/trade/spot/${token}/USDT`;
            }
            
            var opit = Number(PNL) - Number(totalFee);
            var message = 
                "<b>MULTIMARKET #" + DTChain.Nama_Chain.toUpperCase() + "</b>" +
                "\n---------------------------------" + 
                "\n<b>USER: #" + user + " | OPIT: " + parseFloat(opit).toFixed(2) + "</b>" +
                "\n<b>SOURCE: </b>" + source + 
                "\n<b>MODAL: " + parseFloat(modal).toFixed(2) + "$ | PNL: " + parseFloat(PNL).toFixed(2) + "$</b>" + 
                "\n<b>ROUTE: </b><a href=\"" + DTChain.URL_Chain + "/address/" + sc_input + "\">" + pair_input + "</a> >> " + 
                "<a href=\"" + DTChain.URL_Chain + "/address/" + sc_output + "\">" + pair_output + "</a>" + 
                "\n<b>BUY: </b><a href=\"" + baseUrlTrade + "\">" + parseFloat(priceBUY).toFixed(10) + "$</a>" +
                "\n<b>SELL: </b><a href=\"https://app.unidex.exchange/?chain=" + DTChain.Nama_Chain + "&from=" + sc_input + "&to=" + sc_output + "\">" + parseFloat(priceSELL).toFixed(10) + "$</a>" +               
                "\n<b>FEEWD: </b><i>" + parseFloat(feeWD).toFixed(2) + "$</i> + <b>SWAP:</b> <i>" + parseFloat(FeeSwap).toFixed(2) + "$</i>" +
                "\n---------------------------------";
            
        // Mengambil setting dari localStorage
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', { ID_GRUP: 0, TOKEN: '' });
        var users = [
            { chat_id: SavedSettingData.ID_GRUP } // Menggunakan ID grup yang disimpan di localStorage
        ];
    
        var token = SavedSettingData.TOKEN; // Menggunakan token yang disimpan di localStorage
        var apiUrl = 'https://api.telegram.org/bot' + token + '/sendMessage';
    
        // Loop melalui daftar pengguna dan mengirim pesan
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var chatId = user.chat_id; // ID chat pengguna
    
            // Membuat permintaan POST menggunakan jQuery
            $.ajax({
                url: apiUrl,
                method: "POST",
                data: {
                    chat_id: chatId,
                    text: message,
                    parse_mode: "HTML",
                    disable_web_page_preview: true
                },
                success: function (response) {
                    // console.log("Message sent successfully");
                },
                error: function (xhr, status, error) {
                    // console.log("Error sending message:", error);
                }
            });
        }
    }
        
});
