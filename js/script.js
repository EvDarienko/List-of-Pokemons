// Анимация стилей

$('.filter-title').on('click', function() {
   if ($('.filter-title + .drop-down-menu').is(':visible')) {
    $('.filter-title + .drop-down-menu').slideUp(400, function() {
        $('.filter-title').removeClass('special');
    }); 
   } else {
    $(this).addClass('special');
    $('.filter-title + .drop-down-menu').slideDown();
   }
})

$('.favorites-title').on('click', function() {
    if ($('.favorites-title + .drop-down-menu').is(':visible')) {
     $('.favorites-title + .drop-down-menu').slideUp(400, function() {
         $('.favorites-title').removeClass('special');
     }); 
    } else {
     $(this).addClass('special');
     $('.favorites-title + .drop-down-menu').slideDown();
    }
})

// Скрипт

const pagination = {
    limit: 30,
    offset: 30,
    page: 1,
    pagesNumber: null,
}

const pokemonsList = document.querySelector('.pokemons-list');
const container = document.querySelector('.container');

const url = 'https://pokeapi.co/api/v2/';

const customUrl = (limit, offset, page) => {
    const customUrl = `?limit=${limit}&offset=${offset * (page - 1)}`;
    return customUrl;
}

let pokemonData = [];
const allRegions = [];
const allTypes = [];

function getAllPokemonsData(customLink) {
    return fetch(`${url}pokemon${customLink}`)
        .then(response => response.json())
        .then(async result => {
            let {results} = result;
            for (let item of results) {
                let {url} = item;
                await fetch(url)
                    .then(response => response.json())
                    .then(allAbilities => {
                        let {name} = allAbilities;

                        let {id} = allAbilities;

                        let {sprites} = allAbilities;
                        let {front_default: image} = sprites;

                        let {height, weight} = allAbilities;

                        let typesStore = [];
                        let {types} = allAbilities;
                        types.forEach(item => {
                            let {type} = item;
                            let {name} = type;
                            typesStore.push(name);
                        })

                        let evolutionsStore = [];
                        getEvolutionChain(allAbilities.species.url, evolutionsStore);

                        pokemonData.push({name, id, image, height, weight, type: typesStore, evolutions: evolutionsStore});
                    })
            }
        })
}


function getEvolutionChain(url, evolStore) {
    fetch(url)
        .then(response => response.json())
        .then(result => {
            let {evolution_chain} = result;
            evolution_chain && fetch(evolution_chain.url)
                .then(response => response.json())
                .then(result => {
                    let {chain} = result;

                    function getAllEvolutions(chain) {
                        if (chain.evolves_to.length) {
                            getAllEvolutions(chain.evolves_to[0]);
                        }
                        evolStore.push(chain.species.name);
                    }

                    getAllEvolutions(chain);
                })
        })
}

// getAllPokemonsData(customUrl(pagination.limit, pagination.offset, pagination.page));

function getAllRegions() {
    return fetch(`${url}region`)
        .then(response => response.json())
        .then(result => {
            let {results: regions} = result;
            regions.forEach(item => {
                allRegions.push(item);
            })
        })
}

function getAllTypes() {
    return fetch(`${url}type`)
        .then(response => response.json())
        .then(result => {
            let {results: types} = result;
            types.forEach(item => {
                allTypes.push(item)
            })
        })
}

function getNumberOfPages() {
    const customLink = customUrl(pagination.limit, pagination.offset, pagination.page);
    return fetch(`${url}pokemon${customLink}`)
        .then(response => response.json())
        .then(result => {
            let {count} = result;
            pagination.pagesNumber = Math.ceil(count / pagination.limit);
        })
}

async function createPagesButtons() {
    await getNumberOfPages();
    const pagesContainer = document.querySelector('.pages-buttons');
    for (let i = 0; i < pagination.pagesNumber; i++) {
        let pageButton = document.createElement('a');
        pageButton.innerHTML = i + 1;
        pageButton.classList.add('page-number');
        pagesContainer.append(pageButton);
    }
}

async function setNewPage() {
    await createPagesButtons();
    let pagesContainer = document.querySelector('.pages-buttons');
    pagesContainer.addEventListener('click', async (e) => {
        e.target.matches('.page-number') && (pagination.page = e.target.textContent);
        pokemonData = [];
        await getAllPokemonsData(customUrl(pagination.limit, pagination.offset, pagination.page));
        console.log(pokemonData);
        createPokemonCard();
    })

}

async function createInitialPokemonCard() {
    await getAllPokemonsData(customUrl(pagination.limit, pagination.offset, pagination.page));
    console.log(pokemonData);
    createPokemonCard();
    await setNewPage();
}

createInitialPokemonCard();

function createPokemonCard() {
    pokemonsList.innerHTML = '';
    pokemonData.forEach((item, index) => {
        let {name, id, image, height, weight, type, evolutions} = item;
        pokemonsList.innerHTML += `
            <div class='pokemon-card'>
                <li>
                    <h2 class='pokemon-name'>
                        ${name}
                    </h2>
                    <p class='pokemon-id'>
                        #${id}
                    </p>
                    <div class='image-wrap'>
                        <img class='pokemon-image' src='${image || "images/pokemon-default.png"}'>
                    </div>
                    <ul class='sizes'>
                        <li>
                            <span>height</span>: 
                            ${height}
                        </li>
                        <li>
                            <span>weight</span>: 
                            ${weight}
                        </li>
                    </ul>
                    <p class='types'>
                        <span>type</span>:
                    </p>
                </li>
                <div class='evolutions-wrap'>
                    <button class='evolutions-button'>
                        evolutions
                    </button>
                    <div class='evolutions'><p></p></div>
                </div>
                <button class='favorite-button'>
                    <i class='fa-solid fa-heart'></i>
                </button>
            </div>    
        `
        type.forEach((elem, i) => {
            let item = document.createElement('span');
            if (i < type.length - 1) {
                item.innerHTML = `${elem}, `;
            } else {
                item.innerHTML = elem;
            }
            document.querySelectorAll('.types')[index].append(item);
        })

        evolutions.forEach((elem, i) => {
            let item = document.createElement('span');
            if (i < evolutions.length - 1) {
                item.innerHTML = `${elem}, `;
            } else {
                item.innerHTML = elem;
            }
            document.querySelectorAll('.evolutions p')[index].append(item);
        })
    })

    pokemonsList.addEventListener('click', e => {

        (e.target.matches('.evolutions-button')) 
        && (e.target.parentElement.querySelector('.evolutions').style.left = '0');

        (e.target.closest('.evolutions')) 
        && (e.target.closest('.evolutions').style.left = '-100%');

    })    
}

async function createRegionButtons() {
    await getAllRegions();
    allRegions.forEach((item, index) => {
        document.querySelector('.filter-by-region p').innerHTML += `<button class='region-button'>${item.name}</button>`;
    })
}

async function createTypeButtons() {
    await getAllTypes();
    allTypes.forEach((item, index) => {
        document.querySelector('.filter-by-type p').innerHTML += `<button class='type-button'>${item.name}</button>`;
    })
}

createRegionButtons();

createTypeButtons();

