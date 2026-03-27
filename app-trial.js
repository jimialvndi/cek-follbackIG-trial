// app-trial.js
document.addEventListener('DOMContentLoaded', () => {

    // === LOGIKA POPUP SECURITY & FOLLOW ===
    const securityPopup = document.getElementById('securityPopup');
    const understandSecurityBtn = document.getElementById('understandSecurityBtn');
    
    const followPopup = document.getElementById('followPopup');
    const confirmFollowBtn = document.getElementById('confirmFollowBtn');
    const followLink = document.getElementById('followLink');

    const hasSeenFollowPopup = localStorage.getItem('hasSeenPopup');

    // Selalu tampilkan popup Security
    securityPopup.classList.remove('hidden');

    understandSecurityBtn.addEventListener('click', () => {
        securityPopup.classList.add('hidden');
        if (!hasSeenFollowPopup) {
            followPopup.classList.remove('hidden');
        }
    });

    followLink.addEventListener('click', () => {
        confirmFollowBtn.classList.remove('hidden');
    });

    confirmFollowBtn.addEventListener('click', () => {
        followPopup.classList.add('hidden');
        localStorage.setItem('hasSeenPopup', 'true');
    });
    // === END LOGIKA POPUP ===

    // === LOGIKA PENGECEKAN JSON (VERSI TRIAL 10 AKUN) ===
    document.getElementById('checkBtn').addEventListener('click', () => {
        const followersFile = document.getElementById('followersFile').files[0];
        const followingFile = document.getElementById('followingFile').files[0];
        const resultsTableBody = document.querySelector('#not-following-back tbody');
        const upsellMessage = document.getElementById('upsellMessage');
        const upsellText = document.getElementById('upsellText');
        
        resultsTableBody.innerHTML = ''; 
        upsellMessage.classList.add('hidden'); // Sembunyikan pesan upsell sebelumnya
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        if (!followersFile || !followingFile) {
            alert('Tolong upload kedua file JSON (Followers dan Following)!');
            return;
        }

        const readerFollowers = new FileReader();
        const readerFollowing = new FileReader();

        const processFiles = (followersData, followingData) => {
            let followers = [];
            let following = [];

            if (Array.isArray(followersData)) {
                followers = followersData.map(item => item.title || (item.string_list_data && item.string_list_data[0] ? item.string_list_data[0].value : '')).filter(Boolean);
            } else if (followersData.relationships_followers) {
                followers = followersData.relationships_followers.map(item => item.title || (item.string_list_data && item.string_list_data[0] ? item.string_list_data[0].value : '')).filter(Boolean);
            }

            if (followingData.relationships_following) {
                following = followingData.relationships_following.map(item => item.title || (item.string_list_data && item.string_list_data[0] ? item.string_list_data[0].value : '')).filter(Boolean);
            } else if (Array.isArray(followingData)) {
                following = followingData.map(item => item.title || (item.string_list_data && item.string_list_data[0] ? item.string_list_data[0].value : '')).filter(Boolean);
            }

            const followersSet = new Set(followers.map(u => u.toLowerCase()));
            const notFollowingBack = following.filter(user => !followersSet.has(user.toLowerCase()));

            if (notFollowingBack.length > 0) {
                
                // BATASAN TRIAL: Ambil maksimal 10 data pertama saja
                const trialData = notFollowingBack.slice(0, 10);
                const totalSisa = notFollowingBack.length - 10;

                trialData.forEach((account, index) => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 transition-colors';

                    const numberCell = document.createElement('td');
                    numberCell.textContent = index + 1;
                    numberCell.className = 'px-4 py-2 text-center text-gray-800';

                    const usernameCell = document.createElement('td');
                    const link = document.createElement('a');
                    link.href = `https://www.instagram.com/${account}`;
                    link.target = '_blank';
                    link.textContent = account;
                    link.className = 'text-blue-500 hover:underline font-medium';

                    usernameCell.appendChild(link);
                    usernameCell.className = 'px-4 py-2';

                    row.appendChild(numberCell);
                    row.appendChild(usernameCell);
                    resultsTableBody.appendChild(row);
                });

                // Jika akun yang unfoll lebih dari 10, tampilkan pesan Upsell
                if (totalSisa > 0) {
                    upsellText.innerHTML = `Wah! Ternyata masih ada <strong>${totalSisa} akun lainnya</strong> yang belum follback kamu.`;
                    upsellMessage.classList.remove('hidden');
                }

                const searchHandler = (event) => {
                    const searchTerm = event.target.value.toLowerCase();
                    const rows = resultsTableBody.querySelectorAll('tr');

                    rows.forEach(row => {
                        const username = row.querySelector('td:nth-child(2) a').textContent.toLowerCase();
                        if (username.includes(searchTerm)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                };

                const searchElement = document.getElementById('searchInput');
                const newSearchElement = searchElement.cloneNode(true);
                searchElement.parentNode.replaceChild(newSearchElement, searchElement);
                newSearchElement.addEventListener('input', searchHandler);

            } else {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.textContent = 'Wah! Semua orang mem-follback Anda!';
                cell.colSpan = 2;
                cell.className = 'px-4 py-4 text-center text-green-600 font-bold';
                row.appendChild(cell);
                resultsTableBody.appendChild(row);
            }
        };

        readerFollowers.onload = function (e) {
            try {
                const followersData = JSON.parse(e.target.result);
                readerFollowing.onload = function (e) {
                    try {
                        const followingData = JSON.parse(e.target.result);
                        processFiles(followersData, followingData);
                    } catch (error) {
                        alert('Gagal membaca! File Following.json tidak valid.');
                        console.error(error);
                    }
                };
                readerFollowing.readAsText(followingFile);
            } catch (error) {
                alert('Gagal membaca! File Followers_1.json tidak valid.');
                console.error(error);
            }
        };
        readerFollowers.readAsText(followersFile);
    });
});