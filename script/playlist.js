const playlistId = new URLSearchParams(location.search).get("playlistId");
const mainNavFollowing = document.querySelector("#main-nav-following");
const playlistImage = document.querySelector("#playlist-image");
const playlistName = document.querySelector("#playlist-name");
const playlistFollowers = document.querySelector("#playlist-followers");
const playlistArtists = document.querySelector("#playlist-artists");
const playlistTracks = document.querySelector("#playlists-tracks");
const playBtn = document.querySelector("#play-btn");
const pauseBtn = document.querySelector("#pause-btn");
const nextTrackBtn = document.querySelector("#next-track-btn");
const prevTrackBtn = document.querySelector("#prev-track-btn");
const audio = document.querySelector("#audio");
const playerTrackImage = document.querySelector("#player-track-image");
const playerTrackName = document.querySelector("#player-track-name");
const playerTrackArtist = document.querySelector("#player-track-artist");
const shuffleTrackbtn = document.querySelector("#shuffle-track-btn");
const playerVolumeAdjuster = document.querySelector("#player-track-volume");
const timeline = document.querySelector(".player-timeline");
const timelineFill = document.querySelector(".timeline-fill");

playerVolumeAdjuster.value = localStorage.getItem("currentAudioVolume") * 100;


const getPlaylistInfo = async () => {
    try{
       let response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, 
        {
            headers: {
                "Authorization" : localStorage.getItem("access_token")
            }
        }
       );
       let data = await response.json();
        renderPlayListInfo(data)
    }
    catch(err) {
        console.log(err);
    }
}

getPlaylistInfo()

function renderPlayListInfo(playlistData){
    const tracks = playlistData.tracks.items?.filter(t => t.track.preview_url != null);
    playlistName.innerHTML = playlistData.name;
    playlistImage.src = playlistData.images[0].url
    let artists = playlistData.tracks.items.map(item => item.track.artists[0].name);
    artists.slice(0, 3).forEach((artistName, index) =>{
        index < 2 ?playlistArtists.innerHTML += artistName + ",&nbsp;" : playlistArtists.innerHTML += artistName  + (artists.length > 3 ? " and more" : "")
    })
    playlistFollowers.innerHTML = "Followers : " + playlistData.followers.total;
    const allTracksFragment = document.createDocumentFragment();
    tracks.forEach((trackInfo, index) => {
        const trackItemElement = document.createElement("div");
        trackItemElement.className = " p-[10px] text-[#fff] gap-x-[10px]"
        trackItemElement.innerHTML = `
            <div class="flex items-center gap-x-[10px]">
            <p class="text-[22px] text-[gray] mr-[15px]">${index + 1}</p>
            <img data-track-number="${index}"  class="w-[80px] rounded-lg play-from-list" src="${trackInfo.track.album.images[1].url}"/>
            <div class="flex-1">
                <h3 class="text-[22px]">${trackInfo.track.name}</h3>
                <p class="text-[gray]">${trackInfo.track.artists[0].name}</p>
            </div>
            <div class="flex gap-x-[10px] text-[20px]">
                <i class="bi bi-heart-fill text-[#fff] text-[20px]"></i>
                <p class="text-[gray]">${Math.floor(trackInfo.track.duration_ms / 1000 / 60) + " : " + Math.floor(trackInfo.track.duration_ms / 1000 % 60)}</p>
            </div>
            </div>
        `
        allTracksFragment.appendChild(trackItemElement);
    })
    playlistTracks.appendChild(allTracksFragment);

    console.log(tracks);

    if(playlistId !== localStorage.getItem("lastPlayListId")){
        localStorage.removeItem('currentAudioNumber')
    }
    let currentAudioNumber = +localStorage.getItem("currentAudioNumber") || 0;
    let currentTrackURL = tracks[currentAudioNumber].track.preview_url

    playBtn.addEventListener("click", () => {
        localStorage.setItem("currentAudioNumber", localStorage.getItem("currentAudioNumber") || 0);
        if(!audio.getAttribute("src")){
            audio.src = currentTrackURL
        }
        audio.play();
        playBtn.style.display = "none";
        pauseBtn.style.display = "flex";
        audio.volume = +localStorage.getItem("currentAudioVolume") || 0.5;
        renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))
    })

    pauseBtn.addEventListener("click", () => {
        audio.pause();
        playBtn.style.display = "flex";
        pauseBtn.style.display = "none";
        renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))
    })

    nextTrackBtn.addEventListener("click", () => {
        let nextTrackURL = tracks[+localStorage.getItem("currentAudioNumber") + 1].track.preview_url;
        localStorage.setItem("currentAudioNumber", +localStorage.getItem("currentAudioNumber") + 1)
        audio.src = nextTrackURL;
        audio.play();
        playBtn.style.display = "none";
        pauseBtn.style.display = "flex";
        renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))
    })

    prevTrackBtn.addEventListener("click", () => {
        if(+localStorage.getItem("currentAudioNumber") >= 1){
            var prevTrackURL = tracks[+localStorage.getItem("currentAudioNumber") - 1].track.preview_url;
            localStorage.setItem("currentAudioNumber", +localStorage.getItem("currentAudioNumber") - 1);
        }else{
            var prevTrackURL = tracks[0].track.preview_url;
            localStorage.setItem("currentAudioNumber", 0);
        }
        audio.src = prevTrackURL;
        audio.play();
        playBtn.style.display = "none";
        pauseBtn.style.display = "flex";
        renderPlayerInfo(+localStorage.getItem("currentAudioNumber"));
    })

    shuffleTrackbtn.addEventListener("click", () => {
        let shuffledTrackId = Math.floor(Math.random() * tracks.length)
        let shuffledTrackURL = tracks[shuffledTrackId].track.preview_url;
        localStorage.setItem("currentAudioNumber", shuffledTrackId);
        audio.src = shuffledTrackURL;
        audio.play()
        playBtn.style.display = "none";
        pauseBtn.style.display = "flex";
        renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))

    })
    localStorage.setItem("lastPlayListId", new URLSearchParams(location.search).get("playlistId"));
    function renderPlayerInfo(currentPlayingTrackNumber){
        let playingTrack = tracks[currentPlayingTrackNumber];
        playerTrackImage.src = playingTrack.track.album.images[0].url
        playerTrackName.innerHTML = playingTrack.track.name
        playerTrackArtist.innerHTML = playingTrack.track.artists[0].name;
        // playNextTrackAfterTimeline(currentPlayingTrackNumber)
    }
    renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))

    playlistTracks.addEventListener("click", (e) => {
        if(e.target.classList.contains("play-from-list")){
            let chosenTrackNumber = +e.target.dataset.trackNumber;
            localStorage.setItem("currentAudioNumber", chosenTrackNumber);
            let chosenTrackURL = tracks[chosenTrackNumber].track.preview_url;
            audio.src = chosenTrackURL;
            audio.play()
            playBtn.style.display = "none";
            pauseBtn.style.display = "flex";
            renderPlayerInfo(+localStorage.getItem("currentAudioNumber"))
        }
    })


    // function playNextTrackAfterTimeline(){
    //     let trackAfterTimeId = +localStorage.getItem("currentAudioNumber") + 1;
    //     setInterval(() => {
    //         let trackAfterTimeURL = tracks[trackAfterTimeId].track.preview_url
    //         audio.src = trackAfterTimeURL;
    //         audio.play()
    //         playBtn.style.display = "none";
    //         pauseBtn.style.display = "flex";
    //         localStorage.setItem("currentAudioNumber", +localStorage.getItem("currentAudioNumber") + 1)
    //         renderPlayerInfo(+localStorage.getItem("currentAudioNumber"));
    //         if(+localStorage.getItem("currentAudioNumber") < tracks.length - 1){
    //             playNextTrackAfterTimeline()
    //         }
    //     }, 3000)
    // }

    timeline.addEventListener("click", (e) => {
        const offsets = e.target.getBoundingClientRect();
        const x = e.clientX - offsets.left;
        let selectedPart = 100 / 500 * x;
        timelineFill.style.width = selectedPart + "%"
        if(!audio.getAttribute("src")){
            audio.src = currentTrackURL
        }
        audio.currentTime = 29 / 100 * selectedPart;
        audio.play();
        playBtn.style.display = "none";
        pauseBtn.style.display = "flex";
    })

    setInterval(() => {
        timelineFill.style.width = audio.currentTime * 3.36 + "%";
    }, 100)
}

playerVolumeAdjuster.addEventListener("input", (e) => {
    audio.volume = +e.target.value / 100
    localStorage.setItem("currentAudioVolume", +e.target.value / 100);
})


const getReel = async () => {
    try{
        const response = await fetch("https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFHOzuVTgTizF/playlists",{
            headers: {
                "Authorization": localStorage.getItem("access_token")
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