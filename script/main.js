// Spotify bergan id va secret key

const CLIENT_ID = "e00c5a46bdb34ab6802fe7da6185c715";
const CLIENT_SECRET = "ed02a4709f784ad78c3c02bcd9bf6300";

// htmldan chaqirilgan element id lari
const playListGrid = document.querySelector("#playlist-grid");
const playListReel = document.querySelector("#playlist-reel");
const mainNavFollowing = document.querySelector("#main-nav-following");


//soatga qarab salom 
const text = document.querySelector("#text");
const h = new Date().getHours();
if(h >= 6 && h <= 12){
    text.textContent = "Good Morning";
}

if(h >= 13 && h <= 20){
    text.innerText = "Good Evening";
}
if(h >= 20 && h <= 23){
    text.textContent ="Good Night";
}

// local sorjdan malumotni olish 
const ACCESS_TOKEN = localStorage.getItem("access_token");


// Api ni ichidigi token Bearer suzi va tokenni olish Respons junatish
const getToken = async () => {
    try{
        const response = await fetch("https://accounts.spotify.com/api/token", 
            {
                method: "POST",
                headers: {
                    "Content-Type" : "application/x-www-form-urlencoded",
                    "Authorization" : `Basic ${ btoa( CLIENT_ID + ":" + CLIENT_SECRET ) }`
                },
                body: "grant_type=client_credentials"
            }
        );
        const auth = await response.json();
        localStorage.setItem("access_token",`${auth.token_type } ${auth.access_token}`);
    }
    catch(err){
        console.log(err);
    }
}
getToken();

// playlistni reposn qilish tepadigi 6ta cardga
const getPlaylists = async () => {
    try{
       let response = await fetch("https://api.spotify.com/v1/browse/featured-playlists", 
        {
            headers: {
                "Authorization" : ACCESS_TOKEN
            }
        }
       );
       let {playlists} = await response.json();
       renderPlaylists(playlists.items);
    }
    catch(err) {
        console.log(err);
    }
}
getPlaylists();

// tepadigi 6ta Bulimni yani 5ta api ssilkasini 1 tada fetch qilish
const getReelPlaylists = async () => {
    const ALL_PLAYLIST_FETCH_URLS  = [
        "https://api.spotify.com/v1/browse/categories/toplists/playlists",
        "https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFHOzuVTgTizF/playlists",
        "https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFQ00XGBls6ym/playlists",
        "https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFLVaM30PMBm4/playlists",
        "https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFCbimwdOYlsl/playlists"
    ]

    try{
        const ALL_PLAYLISTS_FOR_REEL_RESPONSE = await Promise.all(ALL_PLAYLIST_FETCH_URLS.map(url => fetch(
            url, 
                {
                    headers: {
                        "Authorization": ACCESS_TOKEN
                    }
                }
        )))
        const ALL_PLAYLISTS_FOR_REEL = await Promise.all(ALL_PLAYLISTS_FOR_REEL_RESPONSE.map(response => {
            return response.json()
        }))
       renderPlaylistsReel(ALL_PLAYLISTS_FOR_REEL)
    }catch(err){
        console.log(err)
    }
}
getReelPlaylists();

// pasdigi hamma cardlarni chiqarish
function renderPlaylistsReel(allplaylists){
    const playlistReelFragment = document.createDocumentFragment();
    const REEL_TITLES = ["Your top mixes", "Made for you", "Recently played", "Jump back in", "Uniquely yours"]
    allplaylists.forEach((playlistRowItem, index) => {
        const playlistRowItemElement = document.createElement("div");
        const playlistRowElementWrapper = document.createElement("div");
        playlistRowElementWrapper.className = "grid grid-cols-4 gap-[32px] gap-[10px] mt-[20px] flex"
        playlistRowItem.playlists.items.slice(0, 4).forEach(playlistItem => {
            const playlistItemElement = document.createElement("div");
            playlistItemElement.className = "bg-[#1b1b1b] backdrop-blur-[3px] rounded-[15px] p-[20px]";
            playlistItemElement.innerHTML = `
                <img class="w-[100%] rounded-[8px]" src="${playlistItem.images[0].url}" alt="image">
                <h3 class="text-[#fff] font-bold text-[25px] mt-[25px] mb-[8px]">${playlistItem.name}</h3>
                <p title="${playlistItem.description}" class="text-[#b3b3b3] text-[20px]">${playlistItem.description.length > 30 ? playlistItem.description.slice(0, 30) + "..." : playlistItem.description}</p>
            `
            playlistRowElementWrapper.appendChild(playlistItemElement);
        })
        playlistRowItemElement.className = "h-auto max-w-[1500px] mx-auto pb-[100px]";
        playlistRowItemElement.innerHTML = `
            <h2 class="text-[#fff] text-[50px] font-bold ">${REEL_TITLES[index]}</h2>
        `
        playlistRowItemElement.appendChild(playlistRowElementWrapper);
        playlistReelFragment.appendChild(playlistRowItemElement);
    })
    playListReel.appendChild(playlistReelFragment);
}


// tepadigi 6ta Bulimni chiqarish Reels
function renderPlaylists(playlists){
    const playListGridFragment = document.createDocumentFragment();
    playlists.slice(0, 6).forEach(playlistGridItem => {
        console.log(playlistGridItem)
        const playListGridItemLinkElement = document.createElement("a");
        playListGridItemLinkElement.href = location.origin + `/pages/playlist.html?playlistId=${playlistGridItem.id}`
        const playListGridItemElement = document.createElement("div");
        playListGridItemElement.className = "bg-[#d7d7d76c]  backdrop-blur-[3px] rounded-[15px] flex items-center p-[10px] gap-[20px]";
        playListGridItemElement.innerHTML = `
            <img class="rounded-[8px] max-h-[100px] h-[100%]" src="${playlistGridItem.images[0].url}" alt="image">
            <h3 class="text-[#fff] font-medium text-[28px]">${playlistGridItem.name}</h3>
        `
        playListGridItemLinkElement.appendChild(playListGridItemElement);
        playListGridFragment.appendChild(playListGridItemLinkElement);
    })
    playListGrid.appendChild(playListGridFragment);
}



const getReel = async () => {
    try{
        const response = await fetch("https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFHOzuVTgTizF/playlists",{
            headers: {
                "Authorization": ACCESS_TOKEN
            }
        });
        const data = await response.json();
        navPlaylistsRender(data.playlists.items)
    }
    catch(err){
        console.log(err);
    }
}
getReel();

function navPlaylistsRender(navallPlaylists){
    const mainNavFragment = document.createDocumentFragment();
    navallPlaylists.forEach(playlist => {
        const navMenuPlayList = document.createElement("ul");
        navMenuPlayList.id = "navMenuPlayList"
        navMenuPlayList.className = "flex p-[10px] gap-[10px] hover:bg-[#fff2] ease-in-out rounded-md p-[5px] relative  hover:cursor-pointer";
        navMenuPlayList.innerHTML = `
            <img class="w-[70px] h-[70px] rounded-[4px]" src="${playlist.images[0].url}" alt="image">
            <ul class="flex flex-col justify-center">
                <h3 class="text-[#fff] font-medium text-[16px]">${playlist.name}</h3>
                <ul class="flex gap-[10px] ">
                    <p class="text-[#b7b7b7] font-medium text-[16px]">${playlist.type}</p>
                    <p class="text-[#b7b7b7] font-medium text-[16px]">${playlist.owner.display_name}</p>
                </ul>
            </ul>  
        `;
        mainNavFragment.appendChild(navMenuPlayList)
    })
    mainNavFollowing.appendChild(mainNavFragment);
}

mainNavFollowing.addEventListener("click", (e) => {
    console.log(e.target.closest("#navMenuPlayList"));
})



