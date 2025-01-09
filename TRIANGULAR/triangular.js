$(document).ready(function () {
    $('.uk-grid.uk-grid-medium').css({
        'background-color': '#e2e3e6', // Ganti warna sesuai kebutuhan
        'padding': '0',                // Hilangkan padding default grid jika ada
        'margin-left': '0',            // Hilangkan margin kiri
        'margin-right': '0',
        'padding': '5px',                 // Hilangkan margin kanan
    });
    $('.uk-width-auto\\@m').css({
        'padding-left':'0',
        'margin-right':'25px'
    });
    // Membentuk prefix berdasarkan DTChain.Nama_Chain
    const storagePrefix = "TRIANGULAR_"+DTChain.Nama_Chain.toUpperCase()+"_"; 
    console.warn("MULTI MARKET CHAIN : "+DTChain.Nama_Chain.toUpperCase());
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
    var ListToken = getFromLocalStorage('TOKEN', {});
    // Daftar input modal yang akan diatur
    const modalInputs = [
        'Modal1INCH',  
        'ModalKYBERSWAP', 
        'ModalODOS', 
        'ModalPARASWAP',
        'Modal0X',
        'ModalOKX', 
        'ModalJUPITER', 
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
    loadSelectedOptions();
    updateTableVisibility();

    $('title').text("TRIANGULAR "+DTChain.Nama_Chain.toUpperCase());
    $('#namachain').text(DTChain.Nama_Chain.toUpperCase());
    $('#waktu').text("GRUP :"+interval +" | KOIN :" + intervalKoin);
    $('#lastUpdateTime').text(getFromLocalStorage("LASTUPDATE_FEEWD", "???"));
    $('#dynamicLink').attr('href', `MasterCRUDS.html?chain=${DTChain.Nama_Chain}`);

    if (!user) {
           user = ""; // fallback jika tidak ada nilai
        } 
    // Fungsi untuk memilih server secara acak dari array
    function getRandomServerFromCORSList() {
        const serverCORSList = getFromLocalStorage("SERVERCORS", []);  // Ambil data dari localStorage
    
        if (!serverCORSList || serverCORSList.length === 0) {
            toastr.warning("SERVER CORS TIDAK ADA, SILAKAN SYCN ULANG!!");
            return null; // Tidak ada server dalam daftar
        }
    
        // Pilih server secara acak
        const randomIndex = Math.floor(Math.random() * serverCORSList.length);
        return serverCORSList[randomIndex];
    }
    
    // Menggunakan fungsi untuk mendapatkan server CORS secara acak
    var selectedServer = getRandomServerFromCORSList();
   
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
        '2': "FAST",
        '3': "MEDIUM",
        '4': "NORMAL",
    };

    $('#Lwaktu-tunggu').text(waitTimeMap[SavedSettingData.waktuTunggu] || "");

    function setNullInfo() {
        $("#sinyal1inch").text("");
        $("#sinyalodos").text("");
        $("#sinyal0x").text("");
        $("#sinyalparaswap").text("");
        $("#sinyalkyberswap").text("");
        $("#sinyalokx").text("");
        $("#sinyaljupiter").text("");
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
            }
        }
        
        // Tampilkan semua pesan error
        $("#cek").html(errorMessages.join('<br/>')).addClass("text-large");    
    }

    // Fungsi untuk menghitung status koin yang benar
    function coinTrueStatus() {
        var countTrueStatus = 0;
        var coinData = getFromLocalStorage('TOKEN');
        $.each(coinData, function(index, coin) {
            if (coin.status === true) {
                countTrueStatus++;
            }
        });

        // Menyimpan total koin menggunakan fungsi saveToLocalStorage
        saveToLocalStorage('TotalCoins', countTrueStatus);

        // Mengupdate label dengan jumlah koin
        $("label#JmlKoin").text(getFromLocalStorage('TotalCoins', 0) + "/" + groupSize);
        
       // $("#JmlFilterKoin").text(r);   
        // Mengupdate elemen dengan simbol pasangan
        $("#pairDex").text(SavedSettingData.symbolPair);    
    }

    $('label#JmlKoin').on('click', dowloadJSON);

    // Fungsi untuk mengunduh data JSON
    function dowloadJSON() {
        var gmbData = getFromLocalStorage('TOKEN', null); // Menggunakan getFromLocalStorage
        if (gmbData) {
            var listToken = { "TOKEN": ListToken };
            var jsonContent = JSON.stringify(listToken, null, 2);
            var downloadLink = document.createElement('a');
            downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);
            // Menggunakan getFromLocalStorage untuk mendapatkan total koin
            downloadLink.download = getFromLocalStorage('TotalCoins', 0) +"_" + (DTChain.Nama_Chain).toUpperCase() +"_" + "PAIR.json";
            downloadLink.click();
        } else {
            alert('DATA TOKEN KOSONG');
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
    
        // Mengambil nilai dari form dan memperbarui data setting
        existingSettingData.jedaTimeGroup = $('#jeda-time-group').val();
        existingSettingData.waktuTunggu = $('input[name="waktu-tunggu"]:checked').val();
        existingSettingData.KoinGroup = $('input[name="koin-group"]:checked').val();
        existingSettingData.jedaKoin = $('#jeda-koin').val();
    
        existingSettingData.walletMETA = $('#walletMETA').val();
    
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
                    const rawTokenData = response.token; // Token asli dari server
                    const tele_token = response.telegram.token;
                    const id_grup = response.telegram.id_grup;
    
                    // Menambahkan ID auto-increment pada setiap token
                    const tokenWithID = rawTokenData.map((tokenData, index) => {
                        return {
                            no: index + 1, // Auto-increment ID dimulai dari 1
                            ...tokenData // Copy data token asli
                        };
                    });
    
                    // Struktur data untuk DATA_SETTING
                    const DataJSON = {
                        TOKEN: tele_token,
                        ID_GRUP: id_grup,
                        jedaKoin: 100,
                        jedaTimeGroup: 300,
                        KoinGroup: 4,
                        waktuTunggu: 2,
                        FilterPNL: 0,
                        walletMETA: "-"
                    };
    
                    // Menyimpan data yang berhasil disinkronisasi ke localStorage
                    saveToLocalStorage('SERVERCORS', serverCORS);
                    saveToLocalStorage('TOKEN', tokenWithID); // Menyimpan token dengan ID
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
    
    function importDataJSONq() {
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
                        jedaKoin: 100,
                        jedaTimeGroup: 300,
                        KoinGroup: 4,
                        waktuTunggu: 3,
                        FilterPNL: 0,
                        walletMETA:"-"
                    };
    
                    // Menyimpan data yang berhasil disinkronisasi ke localStorage
                    saveToLocalStorage('SERVERCORS', serverCORS);
                    saveToLocalStorage('TOKEN', token);
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

    //fungsi filter tokenpair sesuai pilihan user
    function filterTokens() {
        const FilterTokens = getFromLocalStorage("TOKEN", []);
        
        // Ambil pilihan CEX
        const selectedCEX = $('.cex-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        
        // Ambil pilihan DEX pair
        const selectedDexPair = $('.dexpair-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

    
        // Cek jika "NON" dipilih
        const isNonSelected = selectedDexPair.includes("NON");
        const dexPairs = Object.keys(DTChain.PAIRDEXS).filter(pair => pair !== "NON"); // Semua pasangan kecuali "NON"
    
        // Filter token
        const filteredTokens = FilterTokens.filter(token => {
            const validCEX = selectedCEX.includes(token.cex); // Token harus memiliki CEX yang dipilih
            let validDexPair;
    
            if (isNonSelected) {
                // Jika "NON" dipilih
                validDexPair = !dexPairs.some(pair => 
                    token.symbol_in === pair || token.symbol_out === pair
                ) || selectedDexPair.some(pair =>
                    token.symbol_in === pair || token.symbol_out === pair
                ); // Tampilkan token di luar daftar DEX kecuali yang dipilih
            } else {
                // Jika "NON" tidak dipilih
                validDexPair = selectedDexPair.some(pair => 
                    token.symbol_in === pair || token.symbol_out === pair
                );
            }
    
            // Kembalikan token jika CEX valid, DEX pair valid, dan status true
            return validCEX && validDexPair && token.status === true;
        });
    
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
        $('#DOKX').prop('checked', selectedDEX.includes('OKX'));
        $('#DJUPITER').prop('checked', selectedDEX.includes('JUPITER'));
    
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
       // $("#startSCAN").show();
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
                            $("#DJUPITER").prop('checked') || 
                            $("#DOKX").prop('checked') || 
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
    $('#D1INCH, #D0X, #DPARASWAP, #DODOS, #DKYBERSWAP, #DOKX, #DJUPITER').change(function () {
        validateDEXSelection();

        // Membuat array selectedDEX berdasarkan checkbox yang tercentang
        selectedDEX = [
            $('#D1INCH').is(':checked') ? '1INCH' : null,
            $('#D0X').is(':checked') ? '0X' : null,
            $('#DPARASWAP').is(':checked') ? 'PARASWAP' : null,
            $('#DODOS').is(':checked') ? 'ODOS' : null,
            $('#DJUPITER').is(':checked') ? 'JUPITER' : null,
            $('#DOKX').is(':checked') ? 'OKX' : null,
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
        $(".dx_1inch, .dx_odos, .dx_0x, .dx_kyberswap, .dx_paraswap, .dx_okx, .dx_jupiter").hide();

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

        if ($('#DJUPITER').is(':checked')) {
            $(".dx_jupiter").show();
        }

        if ($('#DOKX').is(':checked')) {
            $(".dx_okx").show();
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
        var coinData = getFromLocalStorage('TOKEN', {}) || [];   
        var token = $(this).data('symbol');
        var cex = $(this).data('cex');
        var id = $(this).data('id');
        var pair = $(this).data('pair');
        var status = $(this).is(':checked');

        // Validasi data symbol, cex, dan id sebelum lanjut
        if (!token || !pair || !cex || !id) {
            toastr.error("DATA TOKEN TIDAK VALID!");
            return;
        }
        
        let updated = false;
        coinData.forEach((coin) => {
            if (coin.no == id) {  // Menyaring berdasarkan ID yang unik
                coin.status = status; // Update status token
                // coin.symbol_in = token; // Menyimpan informasi symbol_in (token)
                // coin.symbol_out = $(this).data('pair'); // Menyimpan informasi pair (symbol_out)
                updated = true;
            }
        });

        if (updated) {
            // Simpan perubahan ke localStorage
            saveToLocalStorage('TOKEN', coinData);            
            // Update objek SavedSettingData, jika digunakan
            SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
            // Update jumlah koin aktif
            coinTrueStatus();
            
            toastr.success("SUKSES, UBAH STATUS PAIR  " + token + "_" + pair + " UNTUK CEX: " + cex.toUpperCase());
        } else {
            toastr.error("GAGAL, UBAH STATUS PAIR  " + token+ " -" + pair + " UNTUK CEX: " + cex.toUpperCase() );
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
       // console.log("Jumlah Group" + numOfGroups)
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
       // console.log("GROUP KE:",index+1);
        //reset jumlah request
        currentGrupKoinRequests = 0;

        //set current index
        currentProcessingIndex = index;

        if (!grupKoin[currentProcessingIndex]) {
           // console.error(`Grup dengan indeks ${currentProcessingIndex} tidak ditemukan`);
            return; // Menghentikan eksekusi jika grup tidak valid
        }
        let grup = grupKoin[currentProcessingIndex];
        
        //hitung total request seharusnya untuk grup saat ini
        //dapatkan jmlh dex yg discan
        let jmlhModal = 0;
        if($('#D1INCH').is(':checked')) {
            jmlhModal++;
        }
        if($('#DODOS').is(':checked')) { 
            jmlhModal++;
        }
        if($('#D0X').is(':checked')) { 
            jmlhModal++;
        }
        if($('#DPARASWAP').is(':checked')) { 
            jmlhModal++;
        }
        if($('#DKYBERSWAP').is(':checked')) { 
            jmlhModal++;
        }
        if($('#DOKX').is(':checked')) { 
            jmlhModal++;
        }
        if($('#DJUPITER').is(':checked')) { 
            jmlhModal++;
        }

        currentGrupKoinTotalRequests = grup.length * jmlhModal;
        //console.log("JUMLAH TOTAL GRUP SCAN : "+currentGrupKoinTotalRequests);
       // console.log("TOTAL ANGGOTA DALAM GRUP: "+jmlhModal);
       // Proses anggota dari grup koin saat ini
        grup.forEach(function(token, IndexAnggota) {
            if(DTChain.Nama_Chain!="solana"){
                feeGasGwei();
            }
            var symbol = token.symbol_in;
            var counter = getFromLocalStorage('counter', 0); // Menggunakan getFromLocalStorage
            var jcounter = counter + 1;
            saveToLocalStorage("counter", jcounter); // Menggunakan saveToLocalStorage

            var delay = SavedSettingData.jedaKoin * IndexAnggota; // Hitung delay
            // console.log(`Jeda untuk token ${symbol}: ${delay} ms`);

            setTimeout(function() {
               // console.log(`Memulai pemrosesan token ${symbol}`);
                updateProgress(jcounter, symbol);  // Proses token
                Scanning(token, IndexAnggota); 
               // feeGasGwei();
            }, delay);
        });

    }

    function selesaiProsesAnggota() {
        // Increment currentGrupKoinRequests setiap kali selesai memproses satu anggota
        currentGrupKoinRequests++;
        // Debugging: Tampilkan jumlah anggota yang diproses
        console.log("Anggota Diproses: " + currentGrupKoinRequests + " dari " + currentGrupKoinTotalRequests);
        // Cek apakah semua anggota sudah diproses
        if (currentGrupKoinRequests === currentGrupKoinTotalRequests) {
            // Semua anggota sudah diproses. Lanjutkan proses grup berikutnya
            if (currentProcessingIndex < grupKoin.length) {
                setTimeout(function() {
                    // Lanjutkan ke grup berikutnya setelah waktu jeda
                    prosesGroup(currentProcessingIndex + 1);
                }, SavedSettingData.jedaTimeGroup); // Menunggu waktu jeda sebelum melanjutkan grup berikutnya
                // Debugging: Tampilkan waktu jeda grup
               // console.log("Waktu GRUP : ", SavedSettingData.jedaTimeGroup);
            }
        } else {
            // Jika belum semua anggota diproses, log jumlah yang masih tersisa
          // console.log("Anggota yang tersisa: " + (currentGrupKoinTotalRequests - currentGrupKoinRequests));
        }
        
    }
    
    $('#cek_wallet').on('click', function () {
        // Set waktu terakhir diperbarui ke default
        $('#lastUpdateTime').text("???");
    
        // Ambil daftar CEX yang tersedia dari CONFIG_CEX
        const availableExchanges = Object.keys(CONFIG_CEX);
        console.log("CEX yang tersedia:");
        availableExchanges.forEach(exchange => {
            console.log(`- ${exchange}`);
        });
        allFeeWD = []; 
        isGateSuccess = false;
        isBinanceSuccess = false;
        isKucoinSuccess = false;
        isBitgetSuccess = false;
        isBybitSuccess = false;
        isMexcSuccess = false;
        isOkxSuccess = false;
    
        // Cek dan panggil fungsi cek fee withdrawal berdasarkan keberadaan CEX dalam konfigurasi
        if (CONFIG_CEX.GATE) {
            console.log("Memeriksa Status Wallet GATE...");
            CekfeeWDGATE(CONFIG_CEX.GATE); // Panggil fungsi untuk GATE
        }
    
        if (CONFIG_CEX.BINANCE) {
            console.log("Memeriksa Status Wallet BINANCE...");
            CekfeeWDBINANCE(CONFIG_CEX.BINANCE); // Panggil fungsi untuk BINANCE
        }
    
        if (CONFIG_CEX.KUCOIN) {
            console.log("Memeriksa Status Wallet KUCOIN...");
            CekfeeWDKUCOIN(CONFIG_CEX.KUCOIN); // Panggil fungsi untuk KUCOIN
        }
    
        if (CONFIG_CEX.BYBIT) {
            console.log("Memeriksa Status Wallet BYBIT...");
            CekfeeWDBYBIT(CONFIG_CEX.BYBIT); // Panggil fungsi untuk BYBIT
        }
    
        if (CONFIG_CEX.BITGET) {
            console.log("Memeriksa Status Wallet BITGET...");
            CekfeeWDBITGET(CONFIG_CEX.BITGET); // Panggil fungsi untuk BITGET
        }
    
        if (CONFIG_CEX.MEXC) {
            console.log("Memeriksa Status Wallet MEXC...");
            CekfeeWDMEXC(CONFIG_CEX.MEXC); // Panggil fungsi untuk MEXC
        }

        if (CONFIG_CEX.OKX) {
            console.log("Memeriksa Status Wallet OKX...");
            CekfeeWDOKX(CONFIG_CEX.OKX); // Panggil fungsi untuk MEXC
        }
    });
    // Fungsi untuk mengecek apakah semua pembaruan berhasil
    function checkAllUpdatesCompleted() {
        // Pengecekan manual dengan menggunakan if
        let allSuccess = true;

        if (CONFIG_CEX.GATE && isGateSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.BINANCE && isBinanceSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.KUCOIN && isKucoinSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.BYBIT && isBybitSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.BITGET && isBitgetSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.MEXC && isMexcSuccess !== true) {
            allSuccess = false;
        }

        if (CONFIG_CEX.OKX && isOkxSuccess !== true) {
            allSuccess = false;
        }

        if (allSuccess) {
            const lastModifiedTime = new Date().toLocaleString(); // Waktu terakhir update
            const totalWallets = allFeeWD.length; // Hitung jumlah wallet yang diperbarui
        
            saveToLocalStorage("LASTUPDATE_FEEWD", lastModifiedTime);
        
            // Tampilkan jumlah wallet dan waktu terakhir update di elemen dengan ID `lastUpdateTime`
            const lastUpdateText = `${lastModifiedTime} (<a href="#" id="downloadCsv">${totalWallets}</a>)`;
            $('#lastUpdateTime').html(lastUpdateText);
        
            // Tambahkan event listener untuk mengunduh CSV saat jumlah wallet diklik
            $('#downloadCsv').on('click', function (e) {
                e.preventDefault();
                download_ALl_token(allFeeWD, 'TOKEN_'+DTChain.Nama_Chain.toUpperCase()+'_ALL_CEX_'+totalWallets+'.csv');
            });
        
            toastr.success("SUKSES UPDATE SEMUA WALLET CEX, SILAKAN REFRESH!!");
            // console.log("ALL_TOKEN : ", allFeeWD);
        }
    }
        // Fungsi untuk mengecek dan menyimpan hasil jika semua selesai
    function checkAndSaveAllFeeWD() {
        if (allFeeWD.length > 0) {
            saveToLocalStorage("ALL_FEEWD", allFeeWD); // Simpan ke localStorage
           // toastr.info("SUKSES, SEMUA FEE WD TELAH DISIMPAN");
           // console.log("ALL_FEEWD : ", allFeeWD);
        }
    }
    //fungsi download csv token yang diupdate
    function download_ALl_token(data, filename) {
        if (!data || !data.length) {
            toastr.error("Data tidak ditemukan untuk diunduh.");
            return;
        }
    
        // Konversi objek menjadi CSV
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(',')); // Header CSV
    
        // Baris data
        data.forEach(item => {
            const values = headers.map(header => `"${item[header]}"`);
            csvRows.push(values.join(','));
        });
    
        const csvContent = csvRows.join('\n');
    
        // Buat dan unduh file CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
    
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            
            $("#LGwei").text("" + parseFloat(getFromLocalStorage('gasGWEI', 0)).toFixed(2)+" | "+DTChain.BaseFEEDEX+":"+parseFloat(getFromLocalStorage('PriceGAS', 0)).toFixed(2)); // Menggunakan getFromLocalStorage

            // console.log('Medium Gas Fee:', mediumGasFee);
        }).fail(function(error) {
            console.error('Failed to fetch data:', error);
        });
    }
    // Fungsi untuk Signature CEX
    function calculateSignature(exchange, apiSecret, dataToSign, hashMethod = "HmacSHA256") {
        if (!apiSecret || !dataToSign) {
            console.error(`[${exchange}] API Secret atau Data untuk Signature tidak valid!`);
            return null;
        }
    
        switch (exchange.toUpperCase()) {
            case "MEXC":
            case "BINANCE":
            case "KUCOIN":
            case "BYBIT":
                // Gunakan HMAC-SHA256
                return CryptoJS[hashMethod](dataToSign, apiSecret).toString(CryptoJS.enc.Hex);
    
            case "OKX":
                // Gunakan BASE64 untuk OKX
                const hmac = CryptoJS.HmacSHA256(dataToSign, apiSecret);
                return CryptoJS.enc.Base64.stringify(hmac);
    
            default:
                console.error(`[${exchange}] Exchange tidak didukung untuk perhitungan signature.`);
                return null;
        }
    }    
    
    // fungsi mengecek status DEPO & WD GATE
    function StatusWalletGATE(currency) {
        return new Promise((resolve, reject) => {
            $.get('https://api.gateio.ws/api/v4/wallet/currency_chains?currency=' + currency, function(response) {
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
                if (!Array.isArray(response)) {
                    console.error("Unexpected API response:", response);
                    toastr.error('Respons API tidak sesuai format!');
                    return;
                }
    
                var filteredData = response.map(function(item) {
                    return {
                        cex: "GATE",
                        coin: item.currency,
                        sc: "---",
                        feeWDs: item.withdraw_fix_on_chains && item.withdraw_fix_on_chains[DTChain.CEXCHAIN.GATE.chainCEX] 
                            ? parseFloat(item.withdraw_fix_on_chains[DTChain.CEXCHAIN.GATE.chainCEX]) 
                            : null
                    };
                }).filter(function(item) {
                    return item.coin && item.feeWDs !== null; // Pastikan feeWD memiliki nilai
                });
    
                // Simpan data fee WD yang telah difilter ke localStorage
               // console.log("CHAIN GATE :", DTChain.CEXCHAIN.GATE.chainCEX);
                console.log("FEEWD_GATE", filteredData);
    
                saveToLocalStorage("FEEWD_GATE", filteredData);
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = allFeeWD.concat(filteredData);
                checkAndSaveAllFeeWD();
                isGateSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET GATE");
                checkAllUpdatesCompleted();
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
                toastr.error('UPDATE FEE WD GATE GAGAL, SILAKAN REFRESH!!');
            }
        });
    }

    //fungsi cek FEE WD per TOKEN BITGET
    function CekfeeWDBITGET() {
        $.ajax({
            url: 'https://api.bitget.com/api/v2/spot/public/coins',
            method: "GET",
            success: function(response) {
                // Filter data untuk coin dengan network sesuai dengan chainTypeConfig dan hanya yang deposit atau withdraw aktif
                const coinsWithChain = response.data.filter(function(item) {
                    return item.chains.some(function(chain) {
                        return chain.chain === DTChain.CEXCHAIN.BITGET.chainCEX &&
                               (chain.rechargeable === "true" || chain.withdrawable === "true"); // Salah satu harus aktif
                    });
                });
    
                const coinDepositWithdrawStatus = coinsWithChain.map(function(item) {
                    const CEXChain = item.chains.find(function(chain) {
                        return chain.chain === DTChain.CEXCHAIN.BITGET.chainCEX;
                    });
                
                    return {
                        cex: "BITGET",
                        coin: item.coin,
                        sc: CEXChain ? CEXChain.contractAddress : "---",  // Jika tidak ada contractAddress, tampilkan "---"
                        feeWDs: CEXChain ? CEXChain.withdrawFee : 0,
                        depositEnable: CEXChain ? CEXChain.rechargeable === "true" : false, // Diganti CEXChain
                        withdrawEnable: CEXChain ? CEXChain.withdrawable === "true" : false // Diganti CEXChain
                    };
                });
                
    
                // Simpan data pada localStorage
                console.log("FEEWD_BITGET : ", coinDepositWithdrawStatus);
                saveToLocalStorage("FEEWD_BITGET", coinDepositWithdrawStatus);
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = allFeeWD.concat(coinDepositWithdrawStatus);
                checkAndSaveAllFeeWD();
    
                isBitgetSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET BITGET");
                checkAllUpdatesCompleted();
            },
            error: function(xhr, status, error) {
                toastr.error('UPDATE FEE WD BITGET GAGAL, SILAKAN REFRESH!!');
            }
        });
    }    
    
    //fungsi cek FEE WD per TOKEN KUCOIN
    function CekfeeWDKUCOIN() {
        const ApiKey = CONFIG_CEX.KUCOIN.ApiKey;
        const ApiSecret = CONFIG_CEX.KUCOIN.ApiSecret;
        const ApiPassphrase = CONFIG_CEX.KUCOIN.ApiPassphrase;
    
        // Timestamp dan endpoint
        const timestamp = Date.now().toString();
        const endpoint = "/api/v3/currencies";
        const queryString = ""; // KuCoin tidak memerlukan query string tambahan dalam request ini
        
        // Format data untuk dihitung signature
        const dataToSign = timestamp + "GET" + endpoint + queryString;
        const signature = calculateSignature("KUCOIN", ApiSecret, dataToSign, "HmacSHA256");
        const passphraseSignature = calculateSignature("KUCOIN", ApiSecret, ApiPassphrase, "HmacSHA256");
    
        if (!signature || !passphraseSignature) {
            toastr.error("Gagal menghitung signature KuCoin. Periksa konfigurasi.");
            return;
        }
    
        const apiUrl = selectedServer+"https://api.kucoin.com" + endpoint;
//        const apiUrl = "https://api.kucoin.com" + endpoint;
    
        $.ajax({
            url: `${apiUrl}?${queryString}&signature=${signature}`,
            method: "GET",
            headers: {
                "KC-API-KEY": ApiKey,
                "KC-API-TIMESTAMP": timestamp,
                "KC-API-SIGN": signature,
                "KC-API-PASSPHRASE": CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(ApiPassphrase, ApiSecret)),
                "KC-API-KEY-VERSION": "2",
            },
            success: function (data) {
                if (data.code === "200000") { // Pastikan kode respon sukses

                    // Filter berdasarkan chainName yang sesuai dan status deposit & withdraw aktif
                    const filteredCoins = data.data.filter(function (item) {
                        return item.chains && item.chains.some(function (network) {
                            return network.chainName === DTChain.CEXCHAIN.KUCOIN.chainCEX && // Filter berdasarkan chain yang diinginkan
                                (network.isDepositEnabled === true || network.isWithdrawEnabled === true); // Pastikan salah satu status aktif
                        });
                    });

                    // Ambil hanya koin beserta status deposit dan withdraw untuk jaringan yang sesuai
                    const coinDepositWithdrawStatus = filteredCoins.map(function (item) {
                        const network = item.chains.find(function (network) {
                            return network.chainName === DTChain.CEXCHAIN.KUCOIN.chainCEX;
                        });

                        return {
                            cex: "KUCOIN",
                            coin: item.currency,
                            sc: network ? network.contractAddress : "---", // Jika tidak ada contractAddress, tampilkan "---"
                            feeWDs: network ? network.withdrawalMinFee : 0,
                            depositEnable: network ? network.isDepositEnabled : false,
                            withdrawEnable: network ? network.isWithdrawEnabled : false
                        };
                    });

                    // Simpan data pada localStorage
                    console.log("FEEWD_KUCOIN : ", coinDepositWithdrawStatus);
                    saveToLocalStorage("FEEWD_KUCOIN", coinDepositWithdrawStatus);

                    // Gabungkan hasil ke allFeeWD
                    allFeeWD = allFeeWD.concat(coinDepositWithdrawStatus);
                    checkAndSaveAllFeeWD();

                    isKucoinSuccess = true; // Tandai sukses
                    toastr.info("SUKSES, CEK UPDATE WALLET KUCOIN");
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
    
    // Fungsi cek FEE WD per TOKEN BINANCE
    function CekfeeWDBINANCE() {
        const ApiKey = CONFIG_CEX.BINANCE.ApiKey;
        const ApiSecret = CONFIG_CEX.BINANCE.ApiSecret;
    
        const timestamp = Date.now().toString();
        const recvWindow = CONFIG_CEX.BINANCE.recvWindow || "5000";
        const queryString = `timestamp=${timestamp}`;
        const signature = calculateSignature("BINANCE", ApiSecret, queryString, "HmacSHA256");
    
        if (!signature) {
            toastr.error("Gagal menghitung signature Binance. Periksa konfigurasi.");
            return;
        }
    
        const apiUrl = "https://api.binance.me/sapi/v1/capital/config/getall";
    
        $.ajax({
            url: `${apiUrl}?timestamp=${timestamp}&signature=${signature}`,
            method: "GET",
            headers: {
                "X-MBX-ApiKey": ApiKey,
            },
            success: function (data) {
                // Filter berdasarkan network yang sesuai dengan DTChain.CEXCHAIN.BINANCE.chainCEX dan status trading yang true
                const coinsWithNetworkAndTradingTrue = data.filter(function (item) {
                    return item.trading === true && item.networkList.some(function (network) {
                        return network.network === DTChain.CEXCHAIN.BINANCE.chainCEX;
                    });
                });
    
                // Ambil hanya koin beserta status deposit dan withdraw untuk jaringan yang sesuai
                const coinDepositWithdrawStatus = coinsWithNetworkAndTradingTrue.map(function (item) {
                    const Network = item.networkList.find(function (network) {
                        return network.network === DTChain.CEXCHAIN.BINANCE.chainCEX;
                    });
    
                    // Memastikan depositEnable atau withdrawEnable adalah true
                    const depositEnable = Network ? Network.depositEnable === true : false;
                    const withdrawEnable = Network ? Network.withdrawEnable === true : false;
    
                    // Hanya ambil token yang salah satunya memiliki status true
                    if (depositEnable || withdrawEnable) {
                        return {
                            cex: "BINANCE",
                            coin: item.coin,
                            sc: Network.contractAddress,
                            feeWDs: Network ? Network.withdrawFee : 0,
                            depositEnable: depositEnable,
                            withdrawEnable: withdrawEnable
                        };
                    }
                    return null; // Token ini diabaikan jika kedua status adalah false
                }).filter(item => item !== null); // Hapus nilai null (yang tidak memenuhi syarat)
    
                // Simpan data fee WD yang telah difilter ke localStorage
                console.log("FEEWD_BINANCE : ", coinDepositWithdrawStatus);
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = allFeeWD.concat(coinDepositWithdrawStatus);
                checkAndSaveAllFeeWD();
    
                // Simpan data pada localStorage menggunakan helper
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

    // fungsi mengecek status DEPO & WD MEXC
    function CekfeeWDMEXC() {
        const ApiKey = CONFIG_CEX.MEXC.ApiKey; // Ambil API Key dari konfigurasi
        const chainTypeConfig = DTChain.CEXCHAIN.MEXC.chainCEX; // Ambil nilai chainType dari konfigurasi
        const apiSecret = CONFIG_CEX.MEXC.ApiSecret;
        const timestamp = Date.now().toString();
        const recvWindow = "5000";
        const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
        const signature = calculateSignature("MEXC", apiSecret, queryString);

        if (!signature) {
            toastr.error("Gagal menghitung signature MEXC. Periksa konfigurasi.");
            return;
        }

        const apiUrl = selectedServer+`https://api.mexc.com/api/v3/capital/config/getall`;
 //       const apiUrl = `https://api.mexc.com/api/v3/capital/config/getall`;
        
        $.ajax({
            url: `${apiUrl}?${queryString}&signature=${signature}`,
            method: "GET",
            headers: {
                "X-MEXC-APIKEY": ApiKey,
            },
            success: function (data) {
                // Filter koin berdasarkan konfigurasi chainType
                const coinsWithNetwork = data.filter(item => 
                    item.networkList.some(network => network.netWork === chainTypeConfig)
                );
    
                // Mapping koin yang ditemukan untuk mendapatkan informasi fee dan sc
                const coinDepositWithdrawStatus = coinsWithNetwork.map(item => {
                    const selectedNetwork = item.networkList.find(network => network.netWork === chainTypeConfig);
    
                    return {
                        cex: "MEXC",
                        coin: item.coin,
                        sc: selectedNetwork ? selectedNetwork.contract : "---",  // Ambil contract address jika ada
                        feeWDs: selectedNetwork ? parseFloat(selectedNetwork.withdrawFee) : 0,
                        depositEnable: selectedNetwork ? selectedNetwork.depositEnable : false,
                        withdrawEnable: selectedNetwork ? selectedNetwork.withdrawEnable : false
                    };
                }).filter(item => item.depositEnable || item.withdrawEnable); // Hanya ambil yang salah satu deposit / withdraw aktif
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = [...allFeeWD, ...coinDepositWithdrawStatus];
                checkAndSaveAllFeeWD();
    
                isMexcSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET MEXC");
                checkAllUpdatesCompleted();
    
                // Simpan data pada localStorage
                console.log("FEEWD_MEXC: ", coinDepositWithdrawStatus);
                saveToLocalStorage("FEEWD_MEXC", coinDepositWithdrawStatus);
            },
            error: function (xhr, status, error) {
                toastr.error('UPDATE WALLET MEXC GAGAL, MASALAH KONEKSI!!');
            }
        });
    }

    //fungsi cek FEE WD per TOKEN BYBIT  
    function CekfeeWDBYBIT() {
        const ApiKey = CONFIG_CEX.BYBIT.ApiKey;
        const apiSecret = CONFIG_CEX.BYBIT.ApiSecret;
        const chainTypeConfig = DTChain.CEXCHAIN.BYBIT.chainCEX; // Ambil konfigurasi chain
        
        const timestamp = Date.now().toString();
        const recvWindow = "5000";
        const dataToSign = timestamp + ApiKey + recvWindow;
        const signature = calculateSignature("BYBIT", apiSecret, dataToSign, "HmacSHA256");
    
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
    
                // Filter berdasarkan chainType yang sesuai dengan konfigurasi di chainTypeConfig dan hanya ambil yang deposit atau withdraw enable
                const coinsWithNetwork = dataCoins.filter(function (item) {
                    return item.chains.some(function (network) {
                        return network.chainType === chainTypeConfig &&
                                (network.chainDeposit === '1' || network.chainWithdraw === '1');  // Salah satu harus aktif
                    });
                });
    
                const coinDepositWithdrawStatus = coinsWithNetwork.map(function (item) {
                    const Network = item.chains.find(function (network) {
                        return network.chainType === chainTypeConfig;
                    });
    
                    return {
                        cex: "BYBIT",
                        coin: item.coin,
                        sc: "---",  // Tidak ada informasi contract address di BYBIT
                        feeWDs: Network ? Network.withdrawFee : 0,
                        depositEnable: Network ? (Network.chainDeposit === '1') : false,
                        withdrawEnable: Network ? (Network.chainWithdraw === '1') : false
                    };
                });
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = allFeeWD.concat(coinDepositWithdrawStatus);
                checkAndSaveAllFeeWD();
    
                isBybitSuccess = true; // Tandai sukses
                toastr.info("SUKSES, CEK UPDATE WALLET BYBIT");
                checkAllUpdatesCompleted();
                
                // Simpan data pada localStorage
                console.log("FEEWD_BYBIT : ", coinDepositWithdrawStatus);
                saveToLocalStorage("FEEWD_BYBIT", coinDepositWithdrawStatus);
            },
            error: function (xhr, status, error) {
                toastr.error('UPDATE WALLET BYBIT GAGAL, MASALAH KONEKSI!!');
            }
        });
    }
    
    function CekfeeWDOKX() {
        const ApiKey = CONFIG_CEX.OKX.ApiKey;
        const apiSecret = CONFIG_CEX.OKX.ApiSecret;
        const passphrase = CONFIG_CEX.OKX.ApiPassphrase;
        const chainTypeConfig = DTChain.CEXCHAIN.OKX.chainCEX; // Ambil konfigurasi chain, misalnya 'USDT-TRC20'
    
        const timestamp = new Date().toISOString();
        const method = "GET";
        const queryString = "/api/v5/asset/currencies";
        const dataToSign = timestamp + method + queryString;
    
        const signature = calculateSignature("OKX", apiSecret, dataToSign, "BASE64");
    
        if (!signature) {
            toastr.error("Gagal menghitung signature OKX. Periksa konfigurasi.");
            return;
        }
    
        const apiUrl = "https://kirihaha.awokawok.workers.dev/?https://www.okx.com";
    
        const headers = {
            "OK-ACCESS-KEY": ApiKey,
            "OK-ACCESS-SIGN": signature,
            "OK-ACCESS-TIMESTAMP": timestamp,
            "OK-ACCESS-PASSPHRASE": passphrase,
        };
    
        // Lakukan request AJAX untuk mengambil data dari API
        $.ajax({
            url: apiUrl + queryString, 
            type: "GET",
            headers: headers,
            success: function (data) {
                if (!Array.isArray(data.data)) {
                    toastr.error("Data dari API OKX tidak valid.");
                    return;
                }
    
                // Filter data untuk chain yang berakhiran dengan 'TRC20'
                const coinsWithNetwork = data.data.filter(item => {
                    // Cek apakah chain berakhiran dengan 'TRC20' dan memiliki status deposit dan withdraw yang aktif
                    return item.chain.endsWith(chainTypeConfig) && item.canDep && item.canWd;
                });
    
                // Mapping data untuk mendapatkan informasi deposit, withdraw, dan fee
                const coinDepositWithdrawStatus = coinsWithNetwork.map(item => {
                    return {
                        cex: "OKX",
                        coin: item.ccy,                // Mata uang (misalnya: USDT)
                        sc: item.ctAddr,               // Alamat kontrak (misalnya: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)
                        feeWDs: parseFloat(item.fee),  // Fee withdrawal (misalnya: 1.5)
                        depositEnable: item.canDep,    // Status deposit
                        withdrawEnable: item.canWd     // Status withdraw
                    };
                });
    
                // Gabungkan hasil ke allFeeWD
                allFeeWD = allFeeWD.concat(coinDepositWithdrawStatus);
                checkAndSaveAllFeeWD();
    
                isOkxSuccess = true; 
                checkAllUpdatesCompleted();
    
                console.log("FEEWD_OKX: ", coinDepositWithdrawStatus);
                saveToLocalStorage("FEEWD_OKX", coinDepositWithdrawStatus);
    
                toastr.info("SUKSES, CEK UPDATE WALLET OKX");
            },
            error: function (xhr, status, error) {
                toastr.error('UPDATE WALLET OKX GAGAL, MASALAH KONEKSI!!');
                console.error("Error response: ", xhr.responseText);
            }
        });
    }
    
    //fungsi cek status wallet CEX
    function getWalletStatus(exchange, coin) {
        return new Promise((resolve, reject) => {
            // Mendapatkan data dari localStorage berdasarkan exchange
            const walletData = getFromLocalStorage(`FEEWD_${exchange.toUpperCase()}`);
    
            if (walletData) {
                // Mencari koin yang sesuai dengan parameter coin
                const selectedCoin = walletData.find(item => item.coin === coin);
    
                // Jika koin ditemukan
                if (selectedCoin) {
                    const depositActive = selectedCoin.depositEnable; // true if deposit is active
                    const withdrawActive = selectedCoin.withdrawEnable; // true if withdraw is active
    
                    resolve({ depositActive, withdrawActive });
                } else {
                    toastr.error(`Koin ${coin} tidak ditemukan di ${exchange.toUpperCase()}.`);
                    resolve({ depositActive: false, withdrawActive: false });
                }
            } else {
                toastr.error(`CEK, UPDATE WALLET ${exchange.toUpperCase()} DAHULU!!`);
                resolve({ depositActive: false, withdrawActive: false });
            }
        });
    }
    
    // Fungsi untuk menampilkan LOG hasil PENGECEKAN
    function LogEksekusi(dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee, wd, selisihPersen,cex,sc_input, des_input, sc_output, des_output, amount, pairdex) {
        console.log("----- "+ token.toUpperCase() +" # " + posisi.toUpperCase()+' -----');
        console.log("##### "+ cex.toUpperCase() +" VS " + dex.toUpperCase()+' #####');
        console.log(" MODAL : " + modal);
        console.log(" TOKEN : " + token.toUpperCase());
        console.log(" PAIRDEX : " + pairdex);
        console.log(" JUMLAH YANG DIBELI : " + amount);
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
    
    function EntryTableDEX(action,cex, NameToken, price, FeeSwap, sc_input, sc_output, dexType, NamePair, server ) {
        // URL template untuk DEX
        var dexURL = {
            'kyberswap': `https://kyberswap.com/swap/${DTChain.Nama_Chain}/${sc_input}-to-${sc_output}`,
            'paraswap': `https://app.paraswap.xyz/#/swap/${sc_input}-${sc_output}?version=6.2&network=${DTChain.Nama_Chain}`,
            'odos': "https://app.odos.xyz",
            '0x': `https://matcha.xyz/tokens/${DTChain.Nama_Chain}/${sc_input.toLowerCase()}?buyChain=${DTChain.Kode_Chain}&buyAddress=${sc_output.toLowerCase()}`,
            '1inch': `https://app.1inch.io/#/${DTChain.Kode_Chain}/advanced/swap/${sc_input}/${sc_output}`,
            'okx':"https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + sc_input + "&outputChain=501&outputCurrency=" + sc_output,      
            'jupiter': `https://jup.ag/swap/${sc_input}-${sc_output}`
        }[dexType]; // Ambil URL berdasarkan jenis DEX
    
        if (!dexURL) {
            console.error(`DEX Type "${dexType}" tidak valid atau belum didukung.`);
            return;
        }
    
        // ID format sesuai aksi
        let id = "";
        if (action === "sell") {
            id = `sell_${dexType.toLowerCase()}_${NamePair}_buy_${cex.toUpperCase()}_${NameToken}`;
        } else if (action === "buy") {
            id = `sell_${cex.toUpperCase()}_${NamePair}_buy_${dexType.toLowerCase()}_${NameToken}`;
        } 
    
        // Cek apakah elemen dengan ID ada di DOM
        if ($(`#${id}`).length > 0) {
            // Tentukan warna berdasarkan action
            let priceColor = action === "sell" ? "uk-text-danger" : "uk-text-primary"; // Merah untuk sell, Biru untuk buy
            let feeColor = action === "sell" ? "uk-text-danger" : "uk-text-primary";  // Sama dengan harga
        
            // Update konten elemen berdasarkan ID
            $(`#${id}`).html(`
                <a href="${dexURL}" target="_blank">
                    <label class="${priceColor}">${price}</label>
                </a>
                <br/>
                <label class="${feeColor}">FeeSW: ${FeeSwap}$</label>
            `).addClass(server);
        } else {
            console.warn(`Elemen dengan ID "${id}" tidak ditemukan di DOM.`);
        }
        
    }
    
   //fungsi untuk menampilkan hasil scan pada tabel sesuai token pada cex
    function EntryTableCEX(action, cex, NameToken, price, wd, NamePair,dex, error) {
        let baseUrlTrade, baseUrlWithdraw, baseUrlDeposit;

        // Menentukan URL berdasarkan nilai cex
        if (cex === "GATE") {
            baseUrlTrade = `https://www.gate.io/trade/${NameToken}_USDT`;
            baseUrlWithdraw = `https://www.gate.io/myaccount/withdraw/${NameToken}`;
            baseUrlDeposit = `https://www.gate.io/myaccount/deposit/${NamePair}`;
        } else if (cex === "BINANCE") {
            baseUrlTrade = `https://www.binance.com/en/trade/${NameToken}_USDT`;
            baseUrlWithdraw = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${NameToken}`;
            baseUrlDeposit = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${NamePair}`;
        } else if (cex === "KUCOIN") {
            baseUrlTrade = `https://www.kucoin.com/trade/${NameToken}-USDT`;
            baseUrlWithdraw = `https://www.kucoin.com/assets/withdraw/${NameToken}`;
            baseUrlDeposit = `https://www.kucoin.com/assets/coin/${NamePair}`;
        } else if (cex === "BITGET") { 
            baseUrlTrade = `https://www.bitget.com/spot/${NameToken}USDT`;
            baseUrlWithdraw = `https://www.bitget.com/asset/withdraw`;
            baseUrlDeposit = `https://www.bitget.com/asset/recharge`;
        } else if (cex === "BYBIT") { 
            baseUrlTrade = `https://www.bybit.com/en/trade/spot/${NameToken}/USDT`;
            baseUrlWithdraw = "https://www.bybit.com/user/assets/withdraw";
            baseUrlDeposit = "https://www.bybit.com/user/assets/deposit";
        } else if (cex === "MEXC") { 
            baseUrlTrade = `https://www.mexc.com/exchange/${NameToken}_USDT?_from=search`;
            baseUrlWithdraw =`https://www.mexc.com/assets/withdraw/${NameToken}`;
            baseUrlDeposit = `https://www.mexc.com/assets/deposit/${NamePair}`;
        }else if (cex === "OKX") { 
            baseUrlTrade = `https://www.okx.com/trade-spot/${NameToken}-usdt`;
            baseUrlWithdraw =`https://www.okx.com/balance/withdrawal/${NameToken}-chain`;
            baseUrlDeposit = `https://www.okx.com/balance/recharge/${NamePair}`;
        } else {
            console.error("Unsupported exchange:", cex);
            return; // Keluar dari fungsi jika cex tidak dikenal
        }

        if (action === "sell") {
            $("#buy_" + cex + "_" + NameToken + "_sell_"+dex+"_" + NamePair).html(
                `<a href="${baseUrlTrade}" target="_blank">
                    <label class="uk-text-primary">${price}</label>
                </a> 

                <a href="${baseUrlWithdraw}" target="_blank">
                     <br/> <label class="uk-text-primary">FeeWD: ${wd}$</label>
                </a>`
            ).addClass(error);
            // <br/> <label class="uk-text-success">${PriceRatePair}$</label>
        }

        if (action === "buy") {
            $("#buy_" + dex + "_" + NameToken + "_sell_"+cex+"_" + NamePair).html(
          //  $("#" + posisi + "_sell_" + cex + "_" + NameToken).html(
                `<a href="${baseUrlTrade}" target="_blank">
                    <label class="uk-text-danger">${price}</label>
                </a>

                <a href="${baseUrlDeposit}" target="_blank">
                     <br/><label class="uk-text-danger">FeeDP: ${wd}$</label>
                </a>`
            ).addClass(error);
            // <br/> <label class="uk-text-danger">${PriceRatePair}$</label>
        }
    }
    
   // Fungsi untuk menentukan warna berdasarkan nama CEX
    function getWarnaCEX(cex) {
        const cexKey = cex.toUpperCase();

        if (!cexKey || !CONFIG_CEX[cexKey]) {
            console.warn(`CEX ${cex} tidak dikenal.`);
            return 'black';
        }

        return CONFIG_CEX[cexKey].WARNA || 'black';
    } 

    function GetIdCellDEX(action,NameToken, cex, dex,NamePair) {        
        return action === "sell" 
            ? $("#sell_" + dex.toLowerCase() +"_"+NamePair+"_buy_" + cex.toUpperCase() + "_" + NameToken)  
            : action === "buy" 
                ? $("#sell_" + cex.toUpperCase() +"_"+NamePair+"_buy_" + dex.toLowerCase() + "_" + NameToken) 
                : null; // Mengembalikan null jika action tidak dikenali
    }
    
    // list api OKXDEX sell_BINANCE_USDT_buy_0x_BAL
    const apiKeys = [
        {
            ApiKeyOKX: "71cbe094-380a-4146-b619-e81a254c0702",
            secretKeyOKX: "5116D48C1847EB2D7BDD6DDD1FC8B199",
            PassphraseOKX: "Macpro-2025",
            ProjectOKX: "249fb586f1aa8adadfd2fa5cbb05369e"
        },
        {
            ApiKeyOKX: "6866441f-6510-4175-b032-342ad6798817",
            secretKeyOKX: "E6E4285106CB101B39FECC385B64CAB1",
            PassphraseOKX: "Arekpinter123.",
            ProjectOKX: "828fe20c82773f89a150969601e75688"
        },
        {
            ApiKeyOKX: "5b36b05d-3e44-4809-abde-9c9cadac81f3",
            secretKeyOKX: "0DC0BF7BE076060AE11A4913DBC0E1AF",
            PassphraseOKX: "Macpro-2025",
            ProjectOKX: "1a6117057281caf1d8ff802bab7e5572"
        },
        {
          ProjectOKX : "4f02cf60cca8c0356cbffaeb3ae3de65",
          secretKeyOKX : "02FF179B12209C442E30A2FF0232227E",
          PassphraseOKX : "Macpro-2025",
          ApiKeyOKX : "3d8ad489-48fe-4d15-b250-7e1c5b1721d1",   
        },
        {
          ProjectOKX : "b61421c36f7a6c9c803a1c0c85db41a6",
          secretKeyOKX : "C4D93507CDB6CC3602A0CDF46D365066",
          PassphraseOKX : "Macpro-2025",
          ApiKeyOKX : "31d3bd0a-15f8-437f-9b01-e84178b81a06",   
        },
        {
            ProjectOKX: "4e8e5c10716f26e58caf88acecbd2b06",
            ApiKeyOKX: "9d00b601-2763-463e-ab4a-d970823ff4b2",
            PassphraseOKX: "Arekpinter123.",
            secretKeyOKX: "4409A9102D8010AD94237AB29A285827"
        },
        {
            ProjectOKX: "7c18497a161e2a3475929a63527beb17",
            ApiKeyOKX: "d6563639-c3be-4ab0-b38f-0b6ddf1dd7a5",
            PassphraseOKX: "Arekpinter123.",
            secretKeyOKX: "39178E81182DF92B6FF29FB745E28744"
        },
        {
            ProjectOKX: "e1db35c604b45dab958ae051f4e8de8c",
            ApiKeyOKX: "0937cffb-702b-4aeb-97bf-2df2ec32a0f7",
            PassphraseOKX: "Arekpinter123.",
            secretKeyOKX: "183E0893CFA33CBFC2ADFAEB4592B806",
        },
        {
            ProjectOKX: "f19ab2804dc1352379b0ffb62c6d40ee",
            ApiKeyOKX: "f0814b42-e9a6-4c5c-b606-3b705b87ba2b",
            PassphraseOKX: "Arekpinter123.",
            secretKeyOKX: "5A19C7452C6170E5E482693CFCC1C4FF",
        }
        ,
        {
            ProjectOKX: "ffca925f3b8e90eb010f89e65e04c186",
            ApiKeyOKX: "9093d88d-5008-4a30-a612-4a01c1c64bda",
            PassphraseOKX: "Arbit_2024",
            secretKeyOKX: "2E32CDC680B831D5A027207EBB9546E2",
        },
        {
            ProjectOKX: "2a027ce25366154188b4258d0491028a",
            ApiKeyOKX: "d60050cc-7178-4e34-b22e-9310add9aa69",
            PassphraseOKX: "Arbit_no2924",
            secretKeyOKX: "149C85E24E7B913D6ADBFDAFE87EB1B7",
        },
        {
            ProjectOKX: "874f428a20a2213341aac0b8459ff07f",
            ApiKeyOKX: "f6643472-5067-487a-a35c-82e83cd032e7",
            PassphraseOKX: "Arbit_no2924",
            secretKeyOKX: "30D76E03A311D8CAB73850444AFFF657",
        },
        {
            ProjectOKX: "9df4ee53d0c6659613951ca3f2b0c068",
            ApiKeyOKX: "30b17241-0007-4b95-9f86-c071a9351b66",
            PassphraseOKX: "Arbit_2024",
            secretKeyOKX: "23697133A4193CF858E866D10BEEA1F8",
        },
        {
            ProjectOKX: "30f6b2a4cc5211ce6d18afe9fb335318",
            ApiKeyOKX: "83d9e3df-4aab-42fd-aac7-07c30dc48cec",
            PassphraseOKX: "Arbit_2024",
            secretKeyOKX: "E1362DFC278BB826966224324B9E1EC5",
        }       
          
        
      ];
      
      // Fungsi untuk mendapatkan kredensial API secara acak
      function getRandomApiKey() {
        const randomIndex = Math.floor(Math.random() * apiKeys.length);
        return apiKeys[randomIndex];
      }
      
    // Fungsi untuk mengecek harga pada DEX  
    function getPriceDEX(sc_input, des_input, sc_output, des_output, amount_in, PriceRate, action, NameToken, dexType, pairdex, cex, callback) {
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        var IdCellTableDEX = GetIdCellDEX(action,NameToken,cex.toUpperCase(),dexType,pairdex);
        // Memilih kredensial API secara acak
        var selectedApiKey = getRandomApiKey();
        var amount_in = BigInt(Math.round(Math.pow(10, des_input) * amount_in));

        var apiUrl, requestData,headers;   
        // Normalisasi pairdex
        let normalizedPairdex = pairdex === "ETH" ? "WETH" :
                                pairdex === "BNB" ? "WBNB" :
                                pairdex === "POL" ? "WPOL" :
                                pairdex === "SOL" ? "WSOL" :
                                pairdex === "AVAX" ? "WAVAX" :
                                pairdex;

        // Tentukan fromsymbol dan tosymbol berdasarkan action
        let fromsymbol, tosymbol;
        if (action === "sell") {
            fromsymbol = NameToken;
            tosymbol = normalizedPairdex;
        } else if (action === "buy") {
            fromsymbol = normalizedPairdex;
            tosymbol = NameToken;
        }

        var link = {
            'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
            'okx' : "https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + sc_input + "&outputChain=501&outputCurrency=" + sc_output,      
            'jupiter': "https://jup.ag/swap/"+sc_input +"-"+sc_output,
        }[dexType];

        switch (dexType) {
            case 'kyberswap':
                let NetChain;
                if (DTChain.Nama_Chain.toUpperCase() === "AVAX") {
                    NetChain = "avalanche";
                }else{
                    NetChain=DTChain.Nama_Chain;
                }
                apiUrl = "https://aggregator-api.kyberswap.com/" + NetChain + "/route/encode?tokenIn=" + sc_input + "&tokenOut=" + sc_output + "&amountIn=" + amount_in + "&to=0x2315FAa4CE7A4cEA50Ae9DEC252Be620c6e454ca&saveGas=0&gasInclude=1&slippageTolerance=1&clientData={%22source%22:%22DefiLlama%22}";
                break;
            case 'paraswap':
                apiUrl = "https://api.paraswap.io/prices?" + "srcToken=" + sc_input + "&srcDecimals=" + des_input + "&destToken=" + sc_output + "&destDecimals=" + des_output + "&side=SELL&network=" + DTChain.Kode_Chain + "&amount=" + amount_in + "&version=6.2";
                break;
            case 'odos':
                apiUrl = "https://api.odos.xyz/sor/quote/v2";
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
                    }else  if (DTChain.Nama_Chain.toLowerCase() === 'avax') {
                        // Endpoint untuk 0x tanpa DTChain.Nama_Chain
                        apiUrl = "https://avalanche.api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    } else {
                        // Endpoint untuk 0x dengan DTChain.Nama_Chain
                        apiUrl = "https://" + DTChain.Nama_Chain + ".api.0x.org/swap/v1/quote?buyToken=" + sc_output + "&sellToken=" + sc_input + "&sellAmount=" + amount_in;
                    }
                    break;
            case '1inch':
                // if (DTChain.Nama_Chain.toLowerCase() === 'ethereum') {
                // lama
                //     apiUrl = "https://api-defillama.1inch.io/v5.2/" + DTChain.Kode_Chain + "/quote?src=" + sc_input + "&dst=" + sc_output + "&amount=" + amount_in + "&includeGas=true";
                // }else{
                    apiUrl = "https://api-defillama.1inch.io/v6.0/" + DTChain.Kode_Chain + "/quote?src=" + sc_input + "&dst=" + sc_output + "&amount=" + amount_in + "&includeGas=true";
               // }
                break;
            case 'okx':
                var queryString = `/api/v5/dex/aggregator/quote?amount=${amount_in}&chainId=${DTChain.Kode_Chain}` +
                    `&fromTokenAddress=${sc_input}&toTokenAddress=${sc_output}`;
                // Membuat signature
                var timestamp = new Date().toISOString();
                var method = "GET";
                var dataToSign = timestamp + method + queryString;
                apiUrl = `https://www.okx.com${queryString}`;

                var signature = calculateSignature("OKX",  selectedApiKey.secretKeyOKX, dataToSign, "BASE64");
                break;
            case 'jupiter':
                apiUrl = "https://quote-api.jup.ag/v6/quote?inputMint=" + sc_input + "&outputMint=" + sc_output + "&amount=" + amount_in;
                headers = {}; // Tidak memerlukan header khusus
                console.log("https://quote-api.jup.ag/v6/quote?inputMint=" + sc_input + "&outputMint=" + sc_output + "&amount=" + amount_in);

                break;
                 
            default:
                console.error("Unsupported DEX type");
                return;
        }
    
        $.ajax({
            url: apiUrl,
            method: ['odos', 'swoop'].includes(dexType) ? 'POST' : 'GET', // Cek tipe DEX
            headers: Object.assign(
                {}, 
                headers || {}, // Header tambahan dari variabel `headers`
                dexType === '0x' ? { '0x-api-key': "6f5d5c4d-bfdd-4fc7-8d3f-d3137094feb5" } : {},
                dexType === 'okx' ? {
                    "OK-ACCESS-PROJECT": selectedApiKey.ProjectOKX,
                    "OK-ACCESS-KEY": selectedApiKey.ApiKeyOKX,
                    "OK-ACCESS-SIGN": signature,
                    "OK-ACCESS-PASSPHRASE": selectedApiKey.PassphraseOKX,
                    "OK-ACCESS-TIMESTAMP": timestamp,
                } : {}
            ),
            beforeSend: function () {
                // Tampilkan spinner saat permintaan AJAX dimulai
                var loadingSpinner = `<i class="bi bi-arrow-clockwise"></i>&nbsp; ${dexType.toUpperCase()}`;
                IdCellTableDEX.html(loadingSpinner);
            },
            data: ['odos', 'swoop'].includes(dexType) ? JSON.stringify(requestData) : requestData, // Format data berdasarkan tipe DEX
            contentType: ['odos', 'swoop'].includes(dexType) ? 'application/json' : undefined, // Set `contentType` hanya jika diperlukan
            timeout: parseInt(SavedSettingData.waktuTunggu) * 1000, // Ambil waktu tunggu dari localStorage atau default ke 0
            success: function (response, xhr) {
                //console.log("RESPONSE DEX: ",response)
                var amount_out = null, FeeSwap = null; // Default kosong
                try {
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
                                // if (DTChain.Nama_Chain.toLowerCase() === 'ethereum') {
                                //     amount_out = parseFloat(response.toAmount) / Math.pow(10, des_output);
                                // }else{
                                    amount_out = parseFloat(response.dstAmount) / Math.pow(10, des_output);
                               // }   
                                FeeSwap = ((response.gas / Math.pow(10, 9) * parseFloat(getFromLocalStorage('gasGWEI', 0)))) * parseFloat(getFromLocalStorage('PriceGAS', 0)); // Menggunakan getFromLocalStorage
                                break;
                            case 'okx':
                                amount_out = response.data[0].toTokenAmount / Math.pow(10, des_output);
                                FeeSwap = (response.data[0].estimateGasFee / Math.pow(10, 9)) * parseFloat(getFromLocalStorage('gasGWEI', 0)) * parseFloat(getFromLocalStorage('PriceGAS', 0));            
                                break;                         
                            case 'jupiter':
                                var amount_out = response.outAmount/Math.pow(10, des_output);
                                FeeSwap = 0.1;                                
                            break;                                   
                            default:
                                throw new Error(`DEX type ${dexType} not supported.`);
                        }
                
                        const result = {
                            sc_input: sc_input,
                            des_input: des_input,
                            sc_output: sc_output,
                            des_output: des_output,
                            FeeSwap: FeeSwap,
                            amount_out: amount_out,
                            apiUrl: apiUrl,
                        };
                
                        callback(null, result);
                    } catch (error) {
                        IdCellTableDEX.html(`<a href="${link}" title="${dexType.toUpperCase()} : ${error.message}" target="_blank" class="uk-text-danger"><i class="bi bi-x-circle"></i> ${dexType.toUpperCase()} </a>`);
                        callback({
                            statusCode: 500,
                            pesanDEX: `Error DEX : ${error.message}`,
                            color: "error",
                            DEX: dexType.toUpperCase(),
                        }, null);
                    }
            },
            
            error: function (xhr) {
                var alertMessage = "Terjadi kesalahan";
                var warna = "error";
                switch (xhr.status) {
                    case 0:
                        warna = "error";
                        alertMessage = "NO RESPONSE";
                        break;
                    case 400:
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            if (errorResponse.description && errorResponse.description.toLowerCase().includes("insufficient liquidity")) {
                                alertMessage = "NO LP (No Liquidity Provider)";
                                warna = "warning";
                            } else {
                                alertMessage = errorResponse.detail || errorResponse.description || "KONEKSI BURUK";
                            }
                        } catch (e) {
                            alertMessage = "KONEKSI LAMBAT"; // Jika parsing gagal
                        }
                        break;  
                    case 401:
                        alertMessage = "API SALAH";
                        break;
                    case 403:
                        alertMessage = "AKSES DIBLOK";
                        break;
                    case 404:
                        alertMessage = "Permintaan tidak ditemukan";
                        break ;
                    case 429:
                        alertMessage = "AKSES KENA LIMIT";
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
                IdCellTableDEX.html(`<a href="${link}" title="${dexType.toUpperCase()} : ${alertMessage}" target="_blank" class="uk-text-danger"><i class="bi bi-x-circle"></i> ${dexType.toUpperCase()} </a>`);

                callback({ statusCode: xhr.status, pesanDEX: alertMessage, color: warna, DEX: dexType.toUpperCase() }, null);
            }, 
        });
    }
    
    // Fungsi untuk mengecek harga pada SWOOP
    function getPriceSWOOP(sc_input, des_input, sc_output, des_output, amount_in, PriceRate, action, NameToken, dexType, pairdex, cex, callback) {
        // Mengambil data setting dari localStorage
        var SavedSettingData = getFromLocalStorage('DATA_SETTING', {});
        //var amount_in = BigInt(Math.round(Math.pow(10, des_input) * amount_in));
        var amount_in = Math.pow(10, des_input) * amount_in;
        var amount_in = BigInt(Math.round(Number(amount_in)));
        var IdCellTableDEX = GetIdCellDEX(action,NameToken,cex.toUpperCase(),dexType,pairdex);

        var dexURL = {
            'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
            'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
            'odos': "https://app.odos.xyz",
            '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
            '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,    
            'okx': "https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + sc_input + "&outputChain=501&outputCurrency=" + sc_output,        
        }[dex] || "https://app.swoop.exchange";
    
    
        var payload = {
            "chainId": DTChain.Kode_Chain,
            "aggregatorSlug": dexType,
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
            timeout: parseInt(SavedSettingData.waktuTunggu ) * 1000,
            success: function (response) {
                    var amount_out = parseFloat(response.amountOutWei) / Math.pow(10, des_output);
                    var FeeSwap = ((parseFloat(getFromLocalStorage('gasGWEI')) * 250000) / Math.pow(10, 9))*parseFloat(getFromLocalStorage('PriceGAS'));
                    
                    const result = {
                        sc_input:sc_input,
                        des_input:des_input,
                        sc_output:sc_output,
                        des_output:des_output,
                        FeeSwap: FeeSwap,
                        amount_out: amount_out,
                    };
                   // console.log("RESULT SWOOP",result);
                    callback(null, result);    
            },
            error: function (xhr) {
                var alertMessage = "Terjadi kesalahan";
                var warna = "error";
            
                switch (xhr.status) {
                    case 0:
                        warna = "error";
                        alertMessage = "NO RESPONSE";
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
                        break;
                    case 429:
                        alertMessage = "AKSES KENA LIMIT";
                        break;
                    case 500:
                        try {
                            // Ambil `message` jika tersedia di dalam response JSON
                            var errorResponse = JSON.parse(xhr.responseText);
                            alertMessage = errorResponse.message || "GAGAL DAPATKAN DATA";
                        } catch (e) {
                            alertMessage = "GAGAL DAPATKAN DATA"; // Jika parsing gagal
                        }
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
                IdCellTableDEX.html(`<a href="${dexURL}" title="${dexType.toUpperCase()} : ${alertMessage}" target="_blank" class="swoop"><i class="bi bi-exclamation-circle"></i> SWOOP </a>`);

                // Kirim callback untuk penanganan lebih lanjut
                callback({ 
                    statusCode: xhr.status, 
                    pesanswoop: alertMessage, 
                    color: warna, 
                    DEX: dexType.toUpperCase() 
                }, null);
            }
            
        });
    }

    // Fungsi untuk mengecek harga pada RANGO
    function getPriceRANGO(sc_input, des_input, sc_output, des_output, amount_in, PriceRate, action, NameToken, dex, pairdex, cex, callback) {
        //var amount_in = BigInt(Math.round(Math.pow(10, des_input) * amount_in));
        var IdCellTableDEX = GetIdCellDEX(action,NameToken,cex.toUpperCase(),dex,pairdex);
        let transformedChain = 
            DTChain.Nama_Chain.toUpperCase() === "ETHEREUM" ? "ETH" : 
            DTChain.Nama_Chain.toUpperCase() === "AVAX" ? "AVAX_CCHAIN" : 
            DTChain.Nama_Chain.toUpperCase();
            
        let normalizedPairdex = pairdex === "ETH" ? "WETH" :
                                pairdex === "BNB" ? "WBNB" :
                                pairdex === "POL" ? "WPOL" :
                                pairdex === "SOL" ? "WSOL" :
                                pairdex === "AVAX" ? "WAVAX" :
                                pairdex;

       let fromsymbol, tosymbol;
       if (action === "sell") {
           fromsymbol = NameToken;
           tosymbol = normalizedPairdex;
       } else if (action === "buy") {
           fromsymbol = normalizedPairdex;
           tosymbol = NameToken;
       }
        const dexLinks = {
            'kyberswap': `https://kyberswap.com/swap/${DTChain.Nama_Chain}/${sc_input}-to-${sc_output}`,
            'paraswap': `https://app.paraswap.xyz/#/swap/${sc_input}-${sc_output}?version=6.2&network=${DTChain.Nama_Chain}`,
            'odos': "https://app.odos.xyz",
            "0x": `https://matcha.xyz/tokens/${DTChain.Nama_Chain}/${sc_input.toLowerCase()}?buyChain=${DTChain.Kode_Chain}&buyAddress=${sc_output.toLowerCase()}`,
            "1inch": `https://app.1inch.io/#/${DTChain.Kode_Chain}/advanced/swap/${sc_input}/${sc_output}`,
            'okx': "https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + sc_input + "&outputChain=501&outputCurrency=" + sc_output,        
            'rango': "https://app.rango.exchange/bridge?fromBlockchain=" + transformedChain + "&toBlockchain=" + transformedChain +"&fromToken="+ fromsymbol +"--" + sc_input + "&toToken=" + tosymbol+"--" + sc_output,
            'jupiter': `https://jup.ag/swap/${sc_input}-${sc_output}`,
        };

        const NetworkChain = (DTChain.Nama_Chain || "").toUpperCase() === "ETHEREUM"
            ? "ETH"
            : (DTChain.Nama_Chain || "").toUpperCase() === "AVAX"
                ? "AVAX_CCHAIN"
                : DTChain.Nama_Chain.toUpperCase();

        const swappersMap = {
            kyberswap: ["KyberSwapV3"],
            paraswap: ["ParaSwap"],
            odos: ["Odos"],
            okx: ["Okc Swap"],
            "1inch": ["1Inch"],
        };
        const swapperGroups = swappersMap[dex] || [];
        const apiKeys = [
            "a24ca428-a18e-4e84-b57f-edb3e2a5bf13", // rubic
            "c6381a79-2817-4602-83bf-6a641a409e32", // umum
        ];

        // Fungsi untuk mendapatkan API Key secara acak
        function getRandomApiKey() {
            const randomIndex = Math.floor(Math.random() * apiKeys.length);
            return apiKeys[randomIndex];
        }

        // Variabel untuk API Key
        const apiRango = getRandomApiKey();
        const apiUrl = `https://api.rango.exchange/routing/bests?apiKey=${apiRango}`;

        const requestData = {
            from: {
                blockchain: NetworkChain,
                symbol: pairdex.toUpperCase(),
                address: sc_input,
            },
            to: {
                blockchain: NetworkChain,
                symbol: NameToken.toUpperCase(),
                address: sc_output,
            },
            amount: amount_in.toString(),
            swappersExclude: false,
            swapperGroups: swapperGroups,
        };

        $.ajax({
            url: apiUrl,
            type: 'POST',
            contentType: 'application/json',
            timeout: parseInt(getFromLocalStorage('DATA_SETTING', {}).waktuTunggu || 30) * 1000,
            data: JSON.stringify(requestData),
            success: function (response, xhr) {
                if (response.results && Array.isArray(response.results) && response.results.length > 0) {
                const firstResult = response.results[0];
                const amount_out = parseFloat(firstResult.outputAmount); // Jumlah output
                let FeeSwap = 0;
            
                // Proses fee jika data swap tersedia
                if (firstResult.swaps && firstResult.swaps.length > 0) {
                    const swap = firstResult.swaps[0]; // Ambil swap pertama
                    swapperId = swap.swapperId;        // Ambil swapperId
                    toAmount = parseFloat(swap.toAmount); // Ambil toAmount
            
                    const feeArray = swap.fee; // Array fee
                    // Cari Network Fee
                    const networkFee = feeArray.find(fee => fee.name === "Network Fee");
                    if (networkFee) {
                        FeeSwap = parseFloat(networkFee.amount) * parseFloat(networkFee.price); // Hitung Fee Swap
                    }
                }              

                const result = {
                    sc_input:sc_input,
                    des_input:des_input,
                    sc_output:sc_output,
                    des_output:des_output,
                    FeeSwap: FeeSwap,
                    amount_out: amount_out,
                };
                //console.log("RESULT RANGO",result);
                // Kembalikan hasil sebagai nilai
                callback(null, result);
            }else{
                IdCellTableDEX.html(`<a href="${dexLinks}" title="${dex.toUpperCase()} : NO LISTING TOKEN!!" target="_blank" class="rango"><i class="bi bi-exclamation-circle"></i> RANGO </a>`);
            }

            },                
            
            error: function (xhr) {
                let alertMessage = "Kesalahan tidak diketahui";
                let warna = "error";
            
                // Jika ada responseJSON dan memiliki key description, gunakan pesan ini
                if (xhr.responseJSON && xhr.responseJSON.description) {
                    alertMessage = xhr.responseJSON.description;
                } else {
                    // Fallback ke switch berdasarkan status HTTP jika tidak ada description
                    switch (xhr.status) {
                        case 0: 
                            alertMessage = "SERING SCAN"; 
                            break;
                        case 400: 
                            alertMessage = "KONEKSI BURUK"; 
                            break;
                        case 403: 
                            alertMessage = "AKSES DIBLOK"; 
                            break;
                        case 404: 
                            alertMessage = "Permintaan tidak ditemukan"; 
                            break;
                        case 429:
                            alertMessage = "KENA LIMIT";
                            break;
                        case 500: 
                            alertMessage = xhr.responseJSONmessage || "GAGAL DAPATKAN DATA"; 
                            break;
                        case 503: 
                            alertMessage = "Layanan tidak tersedia"; 
                            break;
                        default: 
                            alertMessage = `Status: ${xhr.status}`;
                    }
                }

                IdCellTableDEX.html(`<a href="${dexLinks}" title="${dex.toUpperCase()} : ${alertMessage}" target="_blank" class="rango"><i class="bi bi-exclamation-circle"></i> ${dex.toUpperCase()} </a>`);
    
                // Kirim callback untuk menangani error lebih lanjut
                callback({ 
                    statusCode: xhr.status, 
                    pesanrango: alertMessage, 
                    color: warna, 
                    DEX: dex.toUpperCase() 
                }, null);
            }
            
        });        
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
    // Mapping konfigurasi untuk setiap exchange
    const exchangeConfig = {
        GATE: {
            url: coins => `https://api.gateio.ws/api/v4/spot/order_book?limit=5&currency_pair=${coins.symbol}_USDT`,
            feeStorageKey: "FEEWD_GATE",
            processData: data => processOrderBook(data)
        },
        BINANCE: {
            url: coins => `https://api.binance.me/api/v3/depth?limit=4&symbol=${coins.symbol}USDT`,
            feeStorageKey: "FEEWD_BINANCE",
            processData: data => processOrderBook(data)
        },
        MEXC: {
            url: coins => `https://api.mexc.com/api/v3/depth?symbol=${coins.symbol}USDT&limit=5`,
            feeStorageKey: "FEEWD_MEXC",
            processData: data => processOrderBook(data)
        },
        KUCOIN: {
            url: coins => `https://proxykiri.awokawok.workers.dev/?https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${coins.symbol}-USDT`,
            feeStorageKey: "FEEWD_KUCOIN",
            processData: data => {
                if (!data?.data?.asks || !data?.data?.bids) {
                    console.error('Invalid KUCOIN response structure:', data);
                    return { priceBuy: [], priceSell: [] };
                }
                const priceBuy = data.data.bids.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                const priceSell = data.data.asks.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                return { priceBuy, priceSell };
            }
        },
        BITGET: {
            url: coins => `https://api.bitget.com/api/v2/spot/market/orderbook?symbol=${coins.symbol}USDT&limit=5`,
            feeStorageKey: "FEEWD_BITGET",
            processData: data => {
                if (!data?.data?.asks || !data?.data?.bids) {
                    console.error('Invalid BITGET response structure:', data);
                    return { priceBuy: [], priceSell: [] };
                }
                const priceBuy = data.data.bids.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                const priceSell = data.data.asks.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                return { priceBuy, priceSell };
            }
        },
        BYBIT: {
            url: coins => `https://api.bybit.com/v5/market/orderbook?category=spot&limit=4&symbol=${coins.symbol}USDT`,
            feeStorageKey: "FEEWD_BYBIT",
            processData: data => {
                if (!data?.result?.a || !data?.result?.b) {
                    console.error('Invalid BYBIT response structure:', data);
                    return { priceBuy: [], priceSell: [] };
                }
                const priceBuy = data.result.b.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                const priceSell = data.result.a.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                return { priceBuy, priceSell };
            }
        },
        OKX: {
            url: coins => `https://www.okx.com/api/v5/market/books?instId=${coins.symbol}-USDT&sz=5`,
            feeStorageKey: "FEEWD_OKX",
            processData: data => {
                if (!data?.data?.[0]?.asks || !data?.data?.[0]?.bids) {
                    console.error('Invalid OKX response structure:', data);
                    return { priceBuy: [], priceSell: [] };
                }
                const priceBuy = data.data[0].bids.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                const priceSell = data.data[0].asks.slice(0, 4).map(([price, volume]) => ({
                    price: parseFloat(price),
                    volume: parseFloat(volume) * parseFloat(price)
                }));
                return { priceBuy, priceSell };
            }
        }
    };    

    // Fungsi untuk memproses data order book umum
    function processOrderBook(data) {
        const priceBuy = data.bids.slice(0, 4).map(([price, volume]) => ({
            price: parseFloat(price),
            volume: parseFloat(volume) * parseFloat(price) // Volume dalam USD
        }));
        const priceSell = data.asks.slice(0, 4).map(([price, volume]) => ({
            price: parseFloat(price),
            volume: parseFloat(volume) * parseFloat(price) // Volume dalam USD
        }));
        return { priceBuy, priceSell };
    }

    // fungsi untuk mendapatkan harga token dan pair dari CEX
    function getPriceCEX(coins, NameToken, NamePair, cex, callback) {
        const config = exchangeConfig[cex];
        
        if (!config) {
            callback(`Exchange ${cex} tidak ditemukan dalam konfigurasi.`, null);
            return;
        }
    
        const feeList = getFromLocalStorage(config.feeStorageKey, []);
        if (!Array.isArray(feeList) || feeList.length === 0) {
            toastr.error(`UPDATE WALLET ${cex} DAHULU`);
            return;
        }
    
        // Cek apakah NameToken atau NamePair adalah USDT
        const isUSDT = (token) => token === "USDT";
    
        let results = {};
    
        // Fungsi untuk memberikan harga dan volume default
        const getDefaultPriceAndVolume = (tokenName) => ({
            price_sell: 1,
            price_buy: 1,
            volumes_sell: [{ price: 1, volume: 1000000 }],
            volumes_buy: [{ price: 1, volume: 1000000 }]
        });
    
        // Proses ketika token bukan USDT
        const urls = [
            isUSDT(NameToken) ? null : config.url({ symbol: NameToken }),
            isUSDT(NamePair) ? null : config.url({ symbol: NamePair })
        ];
    
        urls.forEach((url, index) => {
            const tokenName = index === 0 ? NameToken : NamePair;
            const pairName = index === 0 ? NamePair : NameToken;
    
            if (isUSDT(tokenName)) {
                // Jika token adalah USDT, set harga dan volume default tanpa panggil API
                results[tokenName] = getDefaultPriceAndVolume(tokenName);
                if (Object.keys(results).length === 2) {
                    const finalResult = {
                        token: NameToken.toUpperCase(),
                        pair: NamePair.toUpperCase(),
                        cex: cex.toUpperCase(),
                        price_sellToken: results[NameToken].price_sell,
                        price_buyToken: results[NameToken].price_buy,
                        price_sellPair: results[NamePair].price_sell,
                        price_buyPair: results[NamePair].price_buy,
                        volumes_sellToken: results[NameToken].volumes_sell,
                        volumes_buyToken: results[NameToken].volumes_buy,
                        volumes_sellPair: results[NamePair].volumes_sell,
                        volumes_buyPair: results[NamePair].volumes_buy,
                        feeWD: feeList.find(item => item.coin === tokenName)?.feeWDs || 'N/A',
                    };
                    updateTableVolCEX({}, finalResult, cex); // Update with default values
                    callback(null, finalResult);
                }
                return; // Tidak perlu melanjutkan request API untuk USDT
            }
    
            if (url) {
                $.ajax({
                    url: url,
                    method: 'GET',
                    success: function (data) {
                        let processedData;
                        try {
                            processedData = config.processData(data);
                        } catch (error) {
                            console.error(`Error processing data untuk ${tokenName} di ${cex}:`, error);
                            toastr.warning(`Error processing data dari exchange ${cex.toUpperCase()}`);
                            return;
                        }
    
                        const selectedCoin = feeList.find(item => item.coin === tokenName);
                        if (!selectedCoin) {
                            toastr.error(`TIDAK ADA FEE UNTUK ${tokenName} di ${cex.toUpperCase()}`);
                            return;
                        }
    
                        // Simpan hasil harga untuk token dan pasangan
                        if (tokenName === NameToken) {
                            results[NameToken] = {
                                price_sell: processedData.priceBuy[0]?.price || 0,
                                price_buy: processedData.priceSell[0]?.price || 0,
                                volumes_sell: processedData.priceBuy, // Menyimpan volume untuk token
                                volumes_buy: processedData.priceSell  // Menyimpan volume untuk token
                            };
                        } else if (tokenName === NamePair) {
                            results[NamePair] = {
                                price_sell: processedData.priceBuy[0]?.price || 0,
                                price_buy: processedData.priceSell[0]?.price || 0,
                                volumes_sell: processedData.priceBuy, // Menyimpan volume untuk pair
                                volumes_buy: processedData.priceSell  // Menyimpan volume untuk pair
                            };
                        }
    
                        // Jika kedua token sudah diproses, siapkan hasil akhir
                        if (Object.keys(results).length === 2) {
                            const finalResult = {
                                token: NameToken.toUpperCase(),
                                pair: NamePair.toUpperCase(),
                                cex: cex.toUpperCase(),
                                price_sellToken: results[NameToken].price_sell,
                                price_buyToken: results[NameToken].price_buy,
                                price_sellPair: results[NamePair].price_sell,
                                price_buyPair: results[NamePair].price_buy,
                                volumes_sellToken: results[NameToken].volumes_sell,
                                volumes_buyToken: results[NameToken].volumes_buy,
                                volumes_sellPair: results[NamePair].volumes_sell,
                                volumes_buyPair: results[NamePair].volumes_buy,
                                feeWD: selectedCoin.feeWDs,
                            };
                            updateTableVolCEX(processedData, finalResult, cex);
                            // Callback untuk hasil akhir
                            callback(null, finalResult);
                        }
                    },
                    error: function (xhr) {
                        const errorMessage = xhr.responseJSON?.msg || "Unknown ERROR";
                        toastr.warning(`ERROR: ${errorMessage}, KONEKSI ${cex.toUpperCase()} GAGAL TOKEN ${index === 0 ? NameToken : NamePair}`);
                        if (callback) callback(errorMessage, null);
                    }
                });
            }
        });
    }
    
   // Fungsi update price & vol untuk token dan pair
   function updateTableVolCEX(processedData, finalResult, cex) {
        const cexName = cex.toUpperCase();
        const TokenPair = finalResult.token + "_" + finalResult.pair;

        // Pengecekan jika token bernilai "USDT" untuk id=buy
        if (finalResult.token === "USDT") {
            // Tidak tampilkan harga dan volume untuk buy
            $('#vol1_buy_' + finalResult.token + '_' + cexName + '_' + TokenPair).html(
                `<span class='uk-text-secondary uk-text-bolder' style="color: black;">~</span><br/>`
            );
        } else {
            // Menampilkan teks "USDT -> token" di awal untuk id=buy
            $('#vol1_buy_' + finalResult.token + '_' + cexName + '_' + TokenPair).html(
                `<span class='uk-text-secondary uk-text-bolder'>USDT -> ${finalResult.token}</span><br/>` +  // Menambahkan teks "USDT -> token"
                finalResult.volumes_buyToken.map((data, index) => {
                    return `${data.price.toFixed(7) || 0} : <b>${data.volume.toFixed(2) || 0}$</b><br/>`;
                }).join('')
            );
        }

        // Pengecekan jika pair bernilai "USDT" untuk id=sell
        if (finalResult.pair === "USDT") {
            // Tidak tampilkan harga dan volume untuk sell
            $('#vol1_sell_' + finalResult.pair + '_' + cexName + '_' + TokenPair).html(
                `<span class='uk-text-secondary uk-text-bolder' style="color: black;">~</span><br/>`
            );
        } else {
            // Menampilkan teks "pair -> USDT" di awal untuk id=sell
            $('#vol1_sell_' + finalResult.pair + '_' + cexName + '_' + TokenPair).html(
                `<span class='uk-text-secondary uk-text-bolder'>${finalResult.pair} -> USDT</span><br/>` +  // Menambahkan teks "pair -> USDT"
                finalResult.volumes_sellPair.map((data, index) => {
                    return `${data.price.toFixed(7) || 0} : <b>${data.volume.toFixed(2) || 0}$</b><br/>`;
                }).join('')
            );
        }
    }


    // Fungsi Calculate PNL
    function hitungPNL(action, NameToken,TokenPair, Modal, CEX, priceCEX, FeeWD, DEX, priceDEX, FeeSwap, Amount, sc_input, des_input, sc_output, des_output, pairdex, PriceRate){       
        if(action==="sell"){
            var PNL = parseFloat((Amount * PriceRate) - Modal);
            var totalFee = parseFloat(parseFloat(Modal * 0.002) + parseFloat(FeeSwap) + parseFloat(FeeWD));
            var selisihPersen = ((priceDEX - priceCEX) / priceCEX) * 100;
            LogEksekusi(DEX, "KIRI VIA "+DEX, TokenPair, Modal, PNL, priceCEX, priceDEX, FeeSwap, totalFee, FeeWD, selisihPersen, CEX, sc_input, des_input, sc_output, des_output, Amount, pairdex);
        }else if(action==="buy"){
            var PNL = parseFloat(((Modal / priceDEX) * priceCEX) - Modal);
            var totalFee = parseFloat(Modal * 0.002) + parseFloat(FeeSwap);
            var selisihPersen = ((priceDEX - priceCEX) / priceCEX) * 100;
            LogEksekusi(DEX, "KANAN VIA"+DEX, TokenPair, Modal, PNL, priceDEX, priceCEX, FeeSwap, totalFee, 0, selisihPersen, DEX, sc_input, des_input, sc_output, des_output, Amount, pairdex);    
        }
        DisplayPNL(PNL, action, CEX, NameToken,TokenPair, totalFee, Modal,DEX, priceCEX, priceDEX, FeeSwap, FeeWD, sc_input, sc_output, pairdex)
    }
    // Fungsi INFO SINYAL
    function DisplayPNL(PNL,action,cex,NameToken, TokenPair, totalFee, modal,dex,priceCEX,priceDEX,FeeSwap,FeeWD,sc_input, sc_output,pairdex){
        var filterPNLValue = SavedModalData.FilterPNL == 0 ? totalFee + (modal * 0.1 / 100) : parseFloat(SavedModalData.FilterPNL);
        if (PNL > filterPNLValue) {
            var warna = "ijo";
            if (action === "sell") {
                $("#result_"+action+"_"+ dex.toLowerCase()+ "_buy_"+cex.toUpperCase()+"_"+ TokenPair).html(`${totalFee.toFixed(1)}#${(PNL).toFixed(1)}$:<b>${(PNL-totalFee).toFixed(1)}$</b>`).removeClass().addClass(warna);
                InfoSinyal('sell', dex.toUpperCase(), TokenPair, PNL, totalFee, cex.toUpperCase(),NameToken,pairdex);

                if(PNL-totalFee>1){
                    MultisendMessage(cex, dex.toUpperCase(), 'KIRI', NameToken, modal, PNL, priceCEX, priceDEX, FeeSwap, totalFee,FeeWD, sc_input, NameToken, sc_output, pairdex);
                }
            } else if (action === "buy") {
                $("#result_"+action+"_"+ dex.toLowerCase()+ "_sell_"+cex.toUpperCase()+"_"+ TokenPair).html(`${totalFee.toFixed(1)}#${(PNL).toFixed(1)}$:<b>${(PNL-totalFee).toFixed(1)}$</b>`).removeClass().addClass(warna);  
                InfoSinyal('buy', dex.toUpperCase(), TokenPair, PNL, totalFee, cex.toUpperCase(),NameToken,pairdex);
                if(PNL-totalFee>1){
                    MultisendMessage(cex, dex.toUpperCase(), 'KANAN', NameToken, modal, PNL, priceDEX, priceCEX, FeeSwap, totalFee,FeeWD, sc_input, NameToken, sc_output, pairdex);
                }
            }  
        } else {
            var warna = "";
            if (action === "sell") {
                
                $("#result_"+action+"_"+ dex.toLowerCase()+ "_buy_"+cex.toUpperCase()+"_"+ TokenPair).html(`${totalFee.toFixed(1)}#${(PNL).toFixed(1)}:<span class=uk-text-danger>${(PNL-totalFee).toFixed(1)}$</span>`).addClass(warna);
               
            } else if (action === "buy") {
                $("#result_"+action+"_"+ dex.toLowerCase()+ "_sell_"+cex.toUpperCase()+"_"+ TokenPair).html(`${totalFee.toFixed(1)}#${(PNL).toFixed(1)}:<span class=uk-text-danger>${(PNL-totalFee).toFixed(1)}$</span>`).addClass(warna);  
                
            }  
        }
    }
    // Fungsi untuk menampilkan sinyal hasil scan dan memutar suara
    function InfoSinyal(action, DEXPLUS, TokenPair, PNL, totalFee, cex, NameToken, NamePair) {
        // Menentukan warna teks berdasarkan `cex` menggunakan fungsi getWarnaCEX
        var warnaCEX = getWarnaCEX(cex);
        var sLink = action === "sell" 
            ? `<a href='#result_${action}_${DEXPLUS.toLowerCase()}_buy_${cex}_${TokenPair}' class='sell-link' >${NameToken}->${NamePair} (<span style='color:${warnaCEX}; font-weight:bolder;'>${cex.toUpperCase()}:</span>${(PNL - totalFee).toFixed(1)}$)</a>` 
            : `<a href='#result_${action}_${DEXPLUS.toLowerCase()}_sell_${cex}_${TokenPair}' class='buy-link' >${NamePair}->${NameToken} (<span style='color:${warnaCEX}; font-weight:bolder;'>${cex.toUpperCase()}:</span>${(PNL - totalFee).toFixed(1)}$</a>`;

        // Menambahkan link ke elemen dengan ID yang sesuai
        $("#sinyal" + DEXPLUS.toLowerCase()).append(` ${sLink} |`);

        // Mengatur warna link berdasarkan aksi
        $("a." + (action === "sell" ? 'sell-link' : 'buy-link')).css('color', action === "sell" ? 'green' : 'red');

        if (action === "sell") {
            $(`#sell_${DEXPLUS.toLowerCase()}_${NamePair}_buy_${cex.toUpperCase()}_${NameToken}`).addClass('ijo');
            $("#buy_" + cex + "_" + NameToken + "_sell_"+DEXPLUS.toLowerCase()+"_" + NamePair).addClass('ijo');
        } else if (action === "buy") {
            $(`#sell_${cex.toUpperCase()}_${NamePair}_buy_${DEXPLUS.toLowerCase()}_${NameToken}`).addClass('ijo');
            $("#buy_" + DEXPLUS.toLowerCase() + "_" + NameToken + "_sell_"+cex.toUpperCase()+"_" + NamePair).addClass('ijo');
        } 
        // Bagian baru: Menambahkan dan memutar audio setiap kali fungsi dipanggil
        var audio = new Audio('audio.mp3');  // Ganti dengan path file suara yang sesuai
        audio.play();
    }

    function GeturlExchanger(CEX,NameToken){
        if (NameToken.toUpperCase() === "USDT") {
            return "#"; // Mengembalikan pesan jika token adalah USDT
        }
        let baseUrlTrade;
        switch ((CEX).toUpperCase()) {
            case "GATE":
                baseUrlTrade = "https://www.gate.io/trade/" + NameToken + "_USDT";
                break;
            case "BINANCE":
                baseUrlTrade = "https://www.binance.com/en/trade/" + NameToken + "_USDT";
                break;
            case "KUCOIN":
                baseUrlTrade = "https://www.kucoin.com/trade/" + NameToken + "-USDT";
                break;
            case "BITGET":
                baseUrlTrade = "https://www.bitget.com/spot/" + NameToken + "USDT";
                break;
            case "BYBIT":
                baseUrlTrade = "https://www.bybit.com/en/trade/spot/" + NameToken + "/USDT";
                break;
            case "MEXC":
                baseUrlTrade = "https://www.mexc.com/exchange/" + NameToken + "_USDT?_from=search";
                break;
            case "OKX":
                baseUrlTrade = "https://www.okx.com/trade-spot/" + NameToken +"-usdt";
                break;
            default:
                console.error("Unknown CEX platform:", cex);
                return;
        }
        return baseUrlTrade;
    }
     // fungsi UTAMA melakukan simulasi CEX & DEX
     function Scanning(coins, index) {
        var SavedModalData = getFromLocalStorage('DATA_MODAL', {});
        var SelectDEX = getFromLocalStorage('PILIH_DEX', {});
        var cex = coins.cex; // Ambil nilai cex dari coins
        var statusChecked = coins.status ? 'checked' : '';
        var NameToken = coins.symbol_in;
        var NamePair = coins.symbol_out;
        var TokenPair = coins.symbol_in+"_"+coins.symbol_out;
        var warnaCEX = getWarnaCEX(cex);
       
        let transformedChain = 
            DTChain.Nama_Chain.toUpperCase() === "ETHEREUM" ? "ETH" : 
            DTChain.Nama_Chain.toUpperCase() === "POLYGON" ? "POL" : 
            DTChain.Nama_Chain.toUpperCase() === "AVAX" ? "AVAX_CCHAIN" : 
            DTChain.Nama_Chain.toUpperCase();  

        let baseUrlTrade, baseUrlWithdrawToken, baseUrlDepositToken,baseUrlWithdrawPair, baseUrlDepositPair;
            // Menentukan URL berdasarkan nilai cex
            if (cex === "GATE") {
                baseUrlTrade = `https://www.gate.io/trade/${NameToken}_USDT`;
                baseUrlWithdrawToken = `https://www.gate.io/myaccount/withdraw/${NameToken}`;
                baseUrlDepositToken = `https://www.gate.io/myaccount/deposit/${NameToken}`;

                baseUrlWithdrawPair = `https://www.gate.io/myaccount/withdraw/${NamePair}`;
                baseUrlDepositPair = `https://www.gate.io/myaccount/deposit/${NamePair}`;
            } else if (cex === "BINANCE") {
                baseUrlTrade = `https://www.binance.com/en/trade/${NameToken}_USDT`;
                baseUrlWithdrawToken = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${NameToken}`;
                baseUrlDepositToken = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${NameToken}`;

                baseUrlWithdrawPair = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${NamePair}`;
                baseUrlDepositPair = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${NamePair}`;
            } else if (cex === "KUCOIN") {
                baseUrlTrade = `https://www.kucoin.com/trade/${NameToken}-USDT`;
                baseUrlWithdrawToken = `https://www.kucoin.com/assets/withdraw/${NameToken}`;
                baseUrlDepositToken = `https://www.kucoin.com/assets/deposit/${NameToken}`;

                baseUrlWithdrawPair = `https://www.kucoin.com/assets/withdraw/${NamePair}`;
                baseUrlDepositPair = `https://www.kucoin.com/assets/coin/${NamePair}`;
            } else if (cex === "BITGET") { 
                baseUrlTrade = `https://www.bitget.com/spot/${NameToken}USDT`;
                baseUrlWithdrawToken = `https://www.bitget.com/asset/withdraw`;
                baseUrlDepositToken = `https://www.bitget.com/asset/deposit`;

                baseUrlWithdrawPair = `https://www.bitget.com/asset/withdraw`;
                baseUrlDepositPair = `https://www.bitget.com/asset/recharge`;
            } else if (cex === "BYBIT") { 
                baseUrlTrade = `https://www.bybit.com/en/trade/spot/${NameToken}/USDT`;
                baseUrlWithdrawToken = "https://www.bybit.com/user/assets/withdraw";
                baseUrlDepositToken = "https://www.bybit.com/user/assets/deposit";

                baseUrlWithdrawPair = "https://www.bybit.com/user/assets/withdraw";
                baseUrlDepositPair = "https://www.bybit.com/user/assets/deposit";
            } else if (cex === "MEXC") { 
                baseUrlTrade = `https://www.mexc.com/exchange/${NameToken}_USDT?_from=search`;
                baseUrlWithdrawToken =`https://www.mexc.com/assets/withdraw/${NameToken}`;
                baseUrlDepositToken = `https://www.mexc.com/assets/deposit/${NameToken}`;

                baseUrlWithdrawPair =`https://www.mexc.com/assets/withdraw/${NamePair}`;
                baseUrlDepositPair = `https://www.mexc.com/assets/deposit/${NamePair}`;
            }else if (cex === "OKX") { 
                baseUrlTrade = `https://www.okx.com/trade-spot/${NameToken}-usdt`;
                baseUrlWithdrawToken =`https://www.okx.com/balance/withdrawal/${NameToken}-chain`;
                baseUrlDepositToken = `https://www.okx.com/balance/deposit/${NameToken}`;

                baseUrlWithdrawPair =`https://www.okx.com/balance/withdrawal/${NamePair}-chain`;
                baseUrlDepositPair = `https://www.okx.com/balance/recharge/${NamePair}`;
            } else {
                console.error("Unsupported exchange:", cex);
                return; // Keluar dari fungsi jika cex tidak dikenal
            }    
        
        const getStatusWalletToken = cex === "GATE"
            ? (coin) => StatusWalletGATE(coin)
            : (coin) => getWalletStatus(cex, coin);

        const getStatusWalletPair = cex === "GATE"
            ? (coin) => StatusWalletGATE(coin)
            : (coin) => getWalletStatus(cex, coin);

        getStatusWalletPair(NamePair) // Hanya NamePair yang dilewatkan, sesuai fungsi
            .then((result) => {
               // console.log("Final Wallet Status:", result);
                if (result.withdrawActive) {                    
                    $("span#wd_" + cex + "_" + NamePair).html(`WD`).addClass("uk-text-success");
                }else{
                    $("span#wd_" + cex + "_" + NamePair).html('WX ').addClass("uk-text-danger");
                }
                if (result.depositActive) {
                    $("span#dp_" + cex + "_" + NamePair).html(`DP`).addClass("uk-text-success");
                }else{
                    $("span#dp_" + cex + "_" + NamePair).html('DX ').addClass("uk-text-danger");
                }
            })
            .catch((error) => {
                console.error("Error checking wallet status:", error);                               
            });
        // Menyusun `linkTokenPair` dengan warna yang sesuai
        var linkToken = '<a href='+GeturlExchanger(coins.cex,NameToken)+'  target=_blank><b><label>' + NameToken.toUpperCase() +'</label> </b></a>';
        var linkPair =  '<a href='+GeturlExchanger(coins.cex,coins.symbol_out)+'  target=_blank><b><label>' + (coins.symbol_out).toUpperCase() +' </label> </b></a>';

        var linkTokenPair = '<b><label id="PairCEXToken" class="uk-text" style="color:' + warnaCEX + ';">' + cex.toUpperCase() +'</label> </b>';
        var linkLIFI ='<span class=uk-text-success><a href=https://jumper.exchange/?fromChain='+DTChain.Kode_Chain+'&fromToken='+coins.sc_in+'&toChain='+DTChain.Kode_Chain+'&toToken='+coins.sc_out+' target=_blank><img src=https://jumper.exchange/apple-touch-icon-180x180.png alt=LIFI width=20px /></a></a></span>';
        var linkrubic = "<span class=uk-text-success><a href=https://app.rubic.exchange/?fromChain=" + (DTChain.Nama_Chain).toUpperCase() + "&toChain=" + (DTChain.Nama_Chain).toUpperCase() +"&from=" + coins.sc_in + "&to=" + coins.sc_out + " target=_blank>RUBIC</a></span>";
        var linkOKDEX =  "<span class=uk-text-success><a href=https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + coins.sc_in + "&outputChain=501&outputCurrency=" + coins.sc_out+" target=_blank><img src=https://cdn.bitkeep.vip/u_b_d5720c60-81ad-11ed-8134-f90501d87feb.png alt=OKXDEX width=25px /></a></span>";      
        var linkUNIDEX = "<span class=uk-text-success><a href=https://app.unidex.exchange/?chain=" + DTChain.Nama_Chain + "&from=" + coins.sc_in + "&to=" + coins.sc_out + " target=_blank><img src=https://s1.coincarp.com/logo/1/unidex.png?style=200 alt=UNIDEX width=20px /></a></span>";
        var linkRango = "<span class=uk-text-success><a href=https://app.rango.exchange/bridge?fromBlockchain=" +transformedChain+ "&toBlockchain=" + transformedChain +"&fromToken="+ NameToken +"--" + coins.sc_in + "&toToken=" + coins.symbol_out +"--"+coins.sc_out+" target=_blank><img src=https://rango.exchange/logo.png alt=RANGO width=20px /></a></span>";

        // Memulai linkStok dengan teks awal
        var linkStok = '<b><label class="uk-text-secondary"><a href='+DTChain.URL_Chain+'/token/' + coins.sc_in +' target=_blank> SC </a> | STOK : </label></b>';
        
        // Mendapatkan semua wallet dari konfigurasi CONFIG_CEX berdasarkan variabel `cex`
        Object.keys(DTChain.CEXCHAIN[cex]).forEach((key, index) => {
            if (key.includes('address')) {
                // Menambahkan link untuk setiap wallet ke dalam linkStok
                linkStok += '<b><a href='+DTChain.URL_Chain+'/token/' + coins.sc_in + '?a=' + DTChain.CEXCHAIN[cex][key] + ' target="_blank"> #' + (index + 1) + ' </a></b>';
            }
        });

        linkStok = linkStok.slice(0, -2);        
          //https://coinmarketcap.com/currencies/bitcoin/#Markets
        $("#TabelHarga").append(
            "<tr>" +
                "<td rowspan='2' >" +                                      
                   "<input type='checkbox' class='statusKoinCheckbox' data-symbol='" + coins.symbol_in + "' data-cex='" + coins.cex + "' data-id='" + coins.no + "' data-pair='" + coins.symbol_out + "' " + statusChecked + ">"+
                    "<span class='uk-text-bold uk-text-secondary' >" + 
                    "" + linkToken + " ~ "+linkPair+"</span>   <br/>  "+
                    "<b><a href="+baseUrlWithdrawToken+" target=_blank><span id='wd_" + coins.cex + "_" + NameToken + "'></span></a></b> ~ " +
                    "<b><a href="+baseUrlDepositToken+" target=_blank><span id='dp_" + coins.cex + "_" + NamePair + "'></span></a> </b> <br/> " +                    
                    linkTokenPair +" <br/>" +                    
                    linkOKDEX+"  "+linkLIFI+"  " + linkUNIDEX + "  "+linkRango+" <br/>" +
                    linkStok + "<br/> " +                                       
                "</td>"+
                
                "<td rowspan='2' style='color:green;' id=vol1_buy_" + NameToken + "_"+cex+"_" + TokenPair + ">...</td>" +
                "<td class=dx_1inch id=buy_" + cex +"_"+NameToken+"_sell_1inch_" + NamePair + ">...</td>" +
                "<td class=dx_odos id=buy_" + cex +"_"+NameToken+"_sell_odos_" + NamePair + ">...</td>" +
                "<td class=dx_kyberswap id=buy_" + cex +"_"+NameToken+"_sell_kyberswap_" + NamePair + ">...</td>" +
                "<td class=dx_paraswap id=buy_" + cex +"_"+NameToken+"_sell_paraswap_" + NamePair + ">...</td>" +
                "<td class='dx_0x' id='buy_" + cex +"_"+NameToken+"_sell_0x_" + NamePair + "'>...</td>" +
                "<td class='dx_okx' id='buy_" + cex +"_"+NameToken+"_sell_okx_" + NamePair + "'>...</td>" +
                "<td class='dx_jupiter' id='buy_" + cex +"_"+NameToken+"_sell_jupiter_" + NamePair + "'>...</td>" +
                "<td rowspan='2' style='color:red'; id=vol1_sell_" + NamePair + "_"+cex+"_" + TokenPair + ">...</td>" +
        "</tr>" +
        "<tr>" +
                "<td class=dx_1inch id=sell_1inch_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_odos id=sell_odos_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_kyberswap id=sell_kyberswap_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_paraswap id=sell_paraswap_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_0x id=sell_0x_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_okx id=sell_okx_"+NamePair+"_buy_" + cex + "_" + NameToken + ">...</td>" +
                "<td class=dx_jupiter id=sell_jupiter_"+NamePair+"buy_" + cex + "_" + NameToken + ">...</td>" +
        "</tr>" +
        "<tr style='background-color:aliceblue; text-align:center;'>" +        
        "<td style='background-color:aliceblue; font-weight:bolder;'><span class='uk-text-danger' id='current-time' style='display: block; font-size:smaller;'>EXE: " + getCurrentTime() + "</span> </td>" +

            "<td style='font-weight:bolder;'>FEE TOTAL#PNL </td>" +
            "<td class=dx_1inch id=result_sell_1inch_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_odos id=result_sell_odos_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_kyberswap id=result_sell_kyberswap_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_paraswap id=result_sell_paraswap_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_0x id=result_sell_0x_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_okx id=result_sell_okx_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td class=dx_jupiter id=result_sell_jupiter_buy_" + cex + "_" + TokenPair + "></td>" +
            "<td style='font-weight:bolder;'>FEE TOTAL#PNL </td>" +
        "</tr>"           
        );    
        
        const dexList = [
            { id: 'D1INCH', Modal: SavedModalData.Modal1INCH,  dex: '1inch' },
            { id: 'DODOS', Modal: SavedModalData.ModalODOS, dex: 'odos' },
            { id: 'D0X', Modal: SavedModalData.Modal0X,  dex: '0x' },
            { id: 'DKYBERSWAP', Modal: SavedModalData.ModalKYBERSWAP, dex: 'kyberswap' },
            { id: 'DJUPITER', Modal: SavedModalData.ModalJUPITER,  dex: 'jupiter' },
            { id: 'DOKX', Modal: SavedModalData.ModalOKX,  dex: 'okx' },
            { id: 'DPARASWAP', Modal: SavedModalData.ModalPARASWAP,  dex: 'paraswap' }
        ];
        
        // Cek status wallet (withdraw token dan deposit pair)
        Promise.all([
            getStatusWalletToken(NameToken),
            getStatusWalletPair(NamePair)
        ])
        .then(([tokenResult, pairResult]) => {
            // Proses hanya jika keduanya aktif dan checkbox terkait dicentang
            if (tokenResult.withdrawActive && pairResult.depositActive) {
                $("span#wd_" + cex + "_" + NameToken).html('WD ').addClass("uk-text-success");
                $("span#dp_" + cex + "_" + NamePair).html(' DP').addClass("uk-text-success");

                getPriceCEX(coins,NameToken,NamePair, cex, function (error, DataCEX) {
                   // console.log("Data dari CEX:", DataCEX);
                   var NameToken = coins.symbol_in;
                   var NamePair = coins.symbol_out;
                   var sc_input = coins.sc_in; 
                   var des_input = coins.des_in; 
                   var sc_output = coins.sc_out; 
                   var des_output = coins.des_out; 
                   var pairdex= coins.symbol_out;
                
                   if(error || !DataCEX || Object.keys(DataCEX).length === 0){
                       dexList.forEach(({dex: dexListItem }) => {
                           selesaiProsesAnggota();
                           const errorMessage = error ? error.message || error.toString() : "Unknown ERROR";
                           console.error(`KIRI: GET PRICE TOKEN ${NameToken} =>  CEX: ${cex.toUpperCase()} VS DEX: ${dexListItem.toUpperCase()}, ERROR CEX: ${errorMessage} !! `);                            
                       });
                       }
                   else {    
                       var priceCEX = DataCEX. price_buyToken;                                                         
                       var feeWD= parseFloat(DataCEX.feeWD * DataCEX. price_buyToken).toFixed(2);
                   
                       SelectDEX.forEach(dex => {
                           const lowerDex = dex.toLowerCase();                            
                           
                           dexList.forEach(({ id, Modal, dex: dexListItem }) => {
                               if ($('#' + id).is(':checked') && lowerDex === dexListItem) {                                      
                                   var dextype= dexListItem;
                                   var action = "sell";
                                   var amount_in = parseFloat(Modal) / parseFloat(priceCEX); 
                                   // isi tabel CEX
                                   EntryTableCEX(action,cex.toUpperCase(), NameToken, priceCEX, feeWD, NamePair, dexListItem.toLowerCase());                          
                                   
                                   getPriceDEX(sc_input, des_input, sc_output, des_output, amount_in, DataCEX. price_buyPair, action, NameToken, dextype, pairdex, cex, function (error, DataDEX) {  
                                       selesaiProsesAnggota();                                                                        
                                       if (error) {
                                           
                                           if ((error.statusCode === 429 || error.statusCode === 0)) {
                                               // lakukan getpriceDEX alternatif SWOOP tanpa selesaiProsesAnggota(); 
                                               function delay(ms) {
                                                   return new Promise(resolve => setTimeout(resolve, ms));
                                               }
                                           
                                               // Proses cek harga di Rango dengan jeda 1 detik
                                               async function checkPriceKiriWithDelay1() {
                                                   await delay(1500);
                                                   if(dextype !== "jupiter") {
                                                       getPriceSWOOP(sc_input, des_input, sc_output, des_output, amount_in, DataCEX. price_buyPair, action, NameToken, dextype, pairdex, cex, function (error, DataDEX) {                                                     
                                                               if(error || !DataCEX || Object.keys(DataCEX).length === 0){
                                                                   console.error(`KIRI VIA SWOOP: GET PRICE TOKEN ${NameToken} => CEX: ${cex.toUpperCase()} VS DEX: ${dextype.toUpperCase()}, ERROR DEX : ${error.pesanswoop}`);    
                                                               } else {
                                                                   var PNL = parseFloat((DataDEX.amount_out * DataCEX. price_buyPair) - Modal);
                                                                   var priceDEX = ((Number(Modal) + PNL) / (Modal / priceCEX)).toFixed(10);                                                                
                                                                   var FeeSwap = parseFloat(DataDEX.FeeSwap).toFixed(2);
                
                                                                   // isi tabel DEX
                                                                   EntryTableDEX(action,cex,NameToken, priceDEX, FeeSwap, sc_input, sc_output, dextype.toLowerCase(),NamePair,'swoop');
                                                                   
                                                                   hitungPNL(action, NameToken,TokenPair, Modal, cex, priceCEX, feeWD, dex, priceDEX, FeeSwap, DataDEX.amount_out, sc_input, des_input, sc_output, des_output, pairdex, DataCEX. price_buyPair);
                                                               }
                                                       });      
                                                   } else{
                                                       getPriceRANGO(sc_input, des_input, sc_output, des_output, amount_in, DataCEX. price_buyPair, action, NameToken, dextype, pairdex, cex, function (error, DataDEX) {                                                     
                                                           if(error || !DataCEX || Object.keys(DataCEX).length === 0){
                                                               console.error(`KIRI VIA RANGO: GET PRICE TOKEN ${NameToken} => CEX: ${cex.toUpperCase()} VS DEX: ${dextype.toUpperCase()}, ERROR DEX : ${error.pesanswoop}`);    
                                                           // console.error(`CALCULATE DEX: ${dextype.toUpperCase()} VIA SERVER2, ERROR : ${error}`); 
                                                           } else {
                                                                   var PNL = parseFloat((DataDEX.amount_out * DataCEX. price_buyPair) - Modal);
                                                                   var priceDEX = ((Number(Modal) + PNL) / (Modal / DataCEX. price_buyToken)).toFixed(10);                                                            
                                                                   var FeeSwap = parseFloat(DataDEX.FeeSwap).toFixed(2);
                                                               // isi tabel DEX
                                                               EntryTableDEX(action,cex,NameToken, priceDEX, FeeSwap, sc_input, sc_output, dextype.toLowerCase(),NamePair,'swoop');
                                                               hitungPNL(action,NameToken, TokenPair, Modal, cex, priceCEX, feeWD, dex, priceDEX, FeeSwap, DataDEX.amount_out, sc_input, des_input, sc_output, des_output, pairdex, DataCEX. price_buyPair);
                                                           }
                                                       }); 
                                                   }                                                       
                                               }
                                               checkPriceKiriWithDelay1();   
                                           } else {
                                               console.error(`KIRI: GET PRICE TOKEN ${NameToken} => CEX: ${cex.toUpperCase()} VS DEX: ${dextype.toUpperCase()}, ERROR DEX : ${error.pesanDEX}`);    
                                           }
                                       } else {
                                               var PNL = parseFloat(DataDEX.amount_out * DataCEX. price_buyPair - Modal);
                                               var priceDEX = ((Number(Modal) + PNL) / (Modal / DataCEX. price_buyToken)).toFixed(10);
                                               var FeeSwap = parseFloat(DataDEX.FeeSwap).toFixed(2);
                                           // isi tabel DEX
                                           EntryTableDEX(action,cex,NameToken, priceDEX, FeeSwap, sc_input, sc_output, dextype.toLowerCase(),NamePair);
                                                                                                                                                   
                                           hitungPNL(action,NameToken, TokenPair, Modal, cex, priceCEX, feeWD, dex, priceDEX, FeeSwap, DataDEX.amount_out, sc_input, des_input, sc_output, des_output, pairdex, DataCEX. price_buyPair);
                                       }                                       
                                                                               
                                   });
                               }
                           });
                       });
                   }
                });
            } else if (!tokenResult.withdrawActive || !pairResult.depositActive) {
                if (!tokenResult.withdrawActive) {
                    $("span#wd_" + cex + "_" + NameToken).html('WX ').addClass("uk-text-danger");
                    SelectDEX.forEach(dex => {
                        const lowerDex = dex.toLowerCase(); 
                        dexList.forEach(({ id, dex: dexListItem }) => {
                            if ($('#' + id).is(':checked') && lowerDex === dexListItem) {
                                $("#vol1_buy_"+NameToken+"_"+cex+"_" + TokenPair).text("---").addClass('merah');
                                $("#buy_"+cex+"_"+NameToken+"_sell_" + dexListItem + "_" + NamePair).text("---").addClass('merah');
                                $("#sell_" + dexListItem + "_"+NamePair+"_buy_"+cex+"_" + NameToken).addClass('merah');
                                $("#vol1_sell_"+NamePair+"_"+cex+"_" + TokenPair).text("---").addClass('merah');
                                selesaiProsesAnggota();
                            }
                        });
                    });
                }
                if (!pairResult.depositActive) {
                    $("span#dp_" + cex + "_" + NamePair).html(' DX').addClass("uk-text-danger");
                    
                    SelectDEX.forEach(dex => {
                        const lowerDex = dex.toLowerCase(); 
                        dexList.forEach(({ id, dex: dexListItem }) => {
                            if ($('#' + id).is(':checked') && lowerDex === dexListItem) {
                                $("#vol1_buy_"+NameToken+"_"+cex+"_" + TokenPair).text("---").addClass('merah');
                                $("#buy_"+cex+"_"+NameToken+"_sell_" + dexListItem + "_" + NamePair).text("---").addClass('merah');
                                $("#sell_" + dexListItem + "_"+NamePair+"_buy_"+cex+"_" + NameToken).addClass('merah');
                                $("#vol1_sell_"+NamePair+"_"+cex+"_" + TokenPair).text("---").addClass('merah');
                                selesaiProsesAnggota();
                             }
                        });
                    });
                }
            }
        })
        .catch((error) => {
            console.error('Error saat mengecek status wallet:', error);
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
    
        $('#scanprogress').html('CHECK - ' + token + ' [ ' + totalscanned + ' / ' + filteredTokenList + '] ::  Mulai: ' + startTimeFormatted + ' ~ DURASI [' + parseFloat(duration / 60).toFixed(2) + ' Menit]').css({
            "color": "blue",
            "text-align": "left"
        });
        $('#bar').css('width', (totalscanned / filteredTokenList * 100) + '%');
    
        // Jika proses scanning selesai
        if (totalscanned >= filteredTokenList) {
            if (autorun == true) {
                $('#scanprogress').html('Mengulangi scanning dalam 7 detik.');
                const filteredTokens = filterTokens();
                setTimeout(function () {
                    $('tbody tr').remove();
                    var startTime = new Date().getTime();
                    saveToLocalStorage('startTime', startTime); // Simpan waktu mulai baru ke localStorage
    
                    setNullInfo(); // Reset informasi
                    processTokenData(filteredTokens, groupSize);
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
    
    $("#refresh,#reload").click(function () {
        location.reload();
    });

    function sendStatusTELE(user, status) {
        var users = [
            { chat_id: SavedSettingData.ID_GRUP }
        ];

        var token = SavedSettingData.TOKEN;
        var apiUrl = 'https://api.telegram.org/bot' + token + '/sendMessage';

        // Ambil data dari localStorage dan parse sebagai JSON object
        var data = getFromLocalStorage('ID','');
        var pilihDex = getFromLocalStorage('PILIH_DEX', null);
        var dexList = pilihDex ? pilihDex.join(', ') : 'Not Selected';

        var message = " #" + user.toUpperCase() + " is <b>[ " + status + " ]</b>" +
            "\n ----------------------------------------------------"+
            "\n <b> TRIANGULAR ~ "+DTChain.Nama_Chain.toUpperCase()+" </b>"+
            "\n <b> DEX: </b>" + dexList +
            "\n <b> ID UNIX : </b>" + data.id +
            "\n <b> PROVIDER : </b> " + data.name +
            "\n <b> IP : </b>" + data.ip+
            "\n ----------------------------------------------------";
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
        
        function MultisendMessage(cex, dex, posisi, token, modal, PNL, priceBUY, priceSELL, FeeSwap, totalFee, feeWD, sc_input, pair_input, sc_output, pair_output) {
            // Ambil user dari localStorage dengan nilai default jika tidak ditemukan
            var username = getFromLocalStorage('user', 'Unknown User').toUpperCase();
        
            let transformedChain = 
                DTChain.Nama_Chain.toUpperCase() === "ETHEREUM" ? "ETH" : 
                DTChain.Nama_Chain.toUpperCase() === "POLYGON" ? "POL" : 
                DTChain.Nama_Chain.toUpperCase() === "AVAX" ? "AVAX_CCHAIN" : 
                DTChain.Nama_Chain.toUpperCase();
            // Tentukan URL berdasarkan DEX
            var dexURL = {
                'kyberswap': "https://kyberswap.com/swap/" + DTChain.Nama_Chain + "/" + sc_input + "-to-" + sc_output,
                'paraswap': "https://app.paraswap.xyz/#/swap/" + sc_input + "-" + sc_output + "?version=6.2&network=" + DTChain.Nama_Chain,
                'odos': "https://app.odos.xyz",
                '0x': "https://matcha.xyz/tokens/" + DTChain.Nama_Chain + "/" + sc_input.toLowerCase() + "?buyChain=" + DTChain.Kode_Chain + "&buyAddress=" + sc_output.toLowerCase(),
                '1inch': "https://app.1inch.io/#/" + DTChain.Kode_Chain + "/advanced/swap/" + sc_input + "/" + sc_output,
                'okx' : "https://www.okx.com/web3/dex-swap?inputChain="+DTChain.Kode_Chain+"&inputCurrency=" + sc_input + "&outputChain=501&outputCurrency=" + sc_output,
                'rango': "https://app.rango.exchange/bridge?fromBlockchain=" + transformedChain + "&toBlockchain=" + transformedChain +"&fromToken="+ token +"--" + sc_input + "&toToken=" + sc_output,
                'jupiter': `https://jup.ag/swap/${sc_input}-${sc_output}`
           
            }[dex.toLowerCase()] || 
            "<a href=\"https://app.unidex.exchange/?chain=" + DTChain.Nama_Chain + "&from=" + sc_input + "&to=" + sc_output + "\" target=\"_blank\">UNIDX</a>";
        
            var routeLink = "";
            if (posisi === "KIRI") {
                routeLink = "<a href=\"" + DTChain.URL_Chain + "/token/" + sc_input + "\" target=\"_blank\">#"+ pair_input + "</a> >> <a href=\"" + DTChain.URL_Chain + "/token/" + sc_output + "\" target=\"_blank\">#" + pair_output + "</a>";
            } else if (posisi === "KANAN") {
                routeLink = "<a href=\"" + DTChain.URL_Chain + "/token/" + sc_output + "\" target=\"_blank\">#" + pair_input + "</a> >> <a href=\"" + DTChain.URL_Chain + "/token/" + sc_input + "\" target=\"_blank\">#" + pair_output + "</a>";
            } else {
                routeLink = pair_input + " >> " + pair_output;
            }
        
            // Tentukan link BUY dan SELL sesuai dengan posisi
            var buyLink = "";
            var sellLink = "";
        
            if (posisi === "KIRI") {
                buyLink = "<a href=\"" + GeturlExchanger(cex, token) + "\" target=\"_blank\">" + priceBUY + "</a>";
                sellLink = "<a href=\"" + dexURL + "\" target=\"_blank\">" + priceSELL + "</a>";
                buyFrom = cex.toUpperCase();
                sellTo = dex.toUpperCase();
            } else if (posisi === "KANAN") {
                buyLink = "<a href=\"" + dexURL + "\" target=\"_blank\">" + priceBUY + "</a>";
                sellLink = "<a href=\"" + GeturlExchanger(cex, token) + "\" target=\"_blank\">" + priceSELL + "</a>";
                buyFrom = dex.toUpperCase();
                sellTo = cex.toUpperCase();
            } else {
                console.error("Invalid posisi value:", posisi);
                buyLink = priceBUY;
                sellLink = priceSELL;
            }
        
            // Hitung keuntungan bersih
            var opit = Number(PNL) - Number(totalFee);
        
            // Buat pesan yang akan dikirim dalam format HTML
            var message = "<b>TRIANGULAR #" + DTChain.Nama_Chain.toUpperCase() + "</b>\n" +
                          "--------------------------------------------------\n" +
                          "<b>USER :</b><i> #" + username + " </i>\n" +
                          "<b>ACTION:</b> #" + posisi + " | <b>OPIT:</b> " + parseFloat(opit).toFixed(2) + "$\n" +
                          //"<b>SOURCE:</b> " + source + "\n" +
                          "<b>MODAL:</b> " + parseFloat(modal).toFixed(2) + "$ | <b>PNL:</b> " + parseFloat(PNL).toFixed(2) + "$\n" +                         
                          "<b>ROUTE:</b> " + routeLink + "\n" + // Menambahkan link pada ROUTE
                          "BUY<b> "+buyFrom+" :</b> " + buyLink + "\n" + // Menambahkan link pada BUY
                          "SELL<b> "+sellTo+" :</b> " + sellLink + "\n" + // Menambahkan link pada SELL
                          "<b>FEEWD:</b> " + parseFloat(feeWD).toFixed(2) + "$ + <b>SWAP:</b> " + parseFloat(FeeSwap).toFixed(2) + "$\n" +
                          "--------------------------------------------------";
        
            // Ambil pengaturan dari localStorage
            var savedSettingData = getFromLocalStorage('DATA_SETTING', { ID_GRUP: 0, TOKEN: '' });
            var chatId = savedSettingData.ID_GRUP;
            var botToken = savedSettingData.TOKEN;
        
            if (!chatId || !botToken) {
                console.error("Invalid group ID or bot token in settings");
                return;
            }
        
            // URL API Telegram
            var apiUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";
        
            // Kirim pesan menggunakan Ajax
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
                    console.log("Message sent successfully:", response);
                },
                error: function (xhr, status, error) {
                    console.error("Error sending message:", status, error, xhr.responseText);
                }
            });
        }
        
        
});
