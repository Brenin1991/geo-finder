class GeoFinder {
    constructor() {
        this.score = 0;
        this.currentLocation = null;
        this.guessLocation = null;
        this.streetView = null;
        this.map = null;
        this.marker = null;
        this.isGuessing = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.markers = [];
        this.polylines = [];

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        try {
            // Inicializar Street View
            this.streetView = new google.maps.StreetViewPanorama(
                document.getElementById('street-view'),
                {
                    enableCloseButton: false,
                    addressControl: false,
                    showRoadLabels: false,
                    zoomControl: false
                }
            );

            // Inicializar Mapa
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                throw new Error('Elemento do mapa não encontrado');
            }

            this.map = new google.maps.Map(mapElement, {
                center: { lat: 0, lng: 0 },
                zoom: 2,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                }
            });

            // Adicionar marcador para o palpite
            this.marker = new google.maps.Marker({
                map: this.map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            // Adicionar evento de clique no mapa
            this.map.addListener('click', (event) => {
                this.marker.setPosition(event.latLng);
            });

            this.loadNewLocation();
        } catch (error) {
            console.error('Erro ao inicializar o jogo:', error);
            this.handleError(error);
        }
    }

    setupEventListeners() {
        document.getElementById('guess-btn').addEventListener('click', () => this.makeGuess());
        document.getElementById('next-round-btn').addEventListener('click', () => this.loadNewLocation());
    }

    async loadNewLocation() {
        try {
            if (this.retryCount >= this.maxRetries) {
                alert('Muitas tentativas em um curto período. Por favor, aguarde alguns minutos e tente novamente.');
                return;
            }

            // Lista expandida de coordenadas aleatórias
            const locations = [
                // Curitiba
                { lat: -25.428954, lng: -49.267137 }, // Jardim Botânico
                { lat: -25.442207, lng: -49.278949 }, // Ópera de Arame
                { lat: -25.416667, lng: -49.266667 }, // Rua XV de Novembro
                { lat: -25.429722, lng: -49.271944 }, // Museu Oscar Niemeyer
                { lat: -25.427778, lng: -49.273889 }, // Parque Tanguá

                // América do Sul
                { lat: -23.550520, lng: -46.633308 }, // São Paulo, Brasil
                { lat: -22.906847, lng: -43.172897 }, // Rio de Janeiro, Brasil
                { lat: -34.603722, lng: -58.381592 }, // Buenos Aires, Argentina
                { lat: -33.448891, lng: -70.669265 }, // Santiago, Chile
                { lat: -12.046374, lng: -77.042793 }, // Lima, Peru
                { lat: 4.609710, lng: -74.081749 },   // Bogotá, Colômbia
                
                // América do Norte
                { lat: 40.712776, lng: -74.005974 },  // Nova York, EUA
                { lat: 34.052235, lng: -118.243683 }, // Los Angeles, EUA
                { lat: 41.878113, lng: -87.629799 },  // Chicago, EUA
                { lat: 43.653225, lng: -79.383186 },  // Toronto, Canadá
                { lat: 49.282729, lng: -123.120738 }, // Vancouver, Canadá
                { lat: 19.432608, lng: -99.133208 },  // Cidade do México, México
                
                // Europa
                { lat: 48.856613, lng: 2.352222 },    // Paris, França
                { lat: 51.507351, lng: -0.127758 },   // Londres, Reino Unido
                { lat: 40.416775, lng: -3.703790 },   // Madrid, Espanha
                { lat: 41.902782, lng: 12.496366 },   // Roma, Itália
                { lat: 52.520008, lng: 13.404954 },   // Berlim, Alemanha
                { lat: 48.135125, lng: 11.581981 },   // Munique, Alemanha
                { lat: 59.329323, lng: 18.068581 },   // Estocolmo, Suécia
                { lat: 59.913869, lng: 10.752245 },   // Oslo, Noruega
                { lat: 55.676098, lng: 12.568337 },   // Copenhague, Dinamarca
                { lat: 52.367573, lng: 4.904139 },    // Amsterdã, Holanda
                { lat: 50.850346, lng: 4.351721 },    // Bruxelas, Bélgica
                { lat: 47.497912, lng: 19.040235 },   // Budapeste, Hungria
                { lat: 50.075538, lng: 14.437800 },   // Praga, República Tcheca
                { lat: 48.208174, lng: 16.373819 },   // Viena, Áustria
                
                // Ásia
                { lat: 35.676191, lng: 139.650310 },  // Tóquio, Japão
                { lat: 34.693737, lng: 135.502165 },  // Osaka, Japão
                { lat: 31.230416, lng: 121.473701 },  // Xangai, China
                { lat: 39.904211, lng: 116.407395 },  // Pequim, China
                { lat: 22.543099, lng: 114.057868 },  // Hong Kong
                { lat: 1.352083, lng: 103.819836 },   // Singapura
                { lat: 13.756331, lng: 100.501765 },  // Bangkok, Tailândia
                { lat: 3.139003, lng: 101.686855 },   // Kuala Lumpur, Malásia
                { lat: 37.566536, lng: 126.977969 },  // Seul, Coreia do Sul
                { lat: 28.613939, lng: 77.209021 },   // Nova Delhi, Índia
                { lat: 19.076090, lng: 72.877426 },   // Mumbai, Índia
                
                // Oceania
                { lat: -33.868820, lng: 151.209290 }, // Sydney, Austrália
                { lat: -37.813628, lng: 144.963058 }, // Melbourne, Austrália
                { lat: -27.469771, lng: 153.025124 }, // Brisbane, Austrália
                { lat: -31.952712, lng: 115.860480 }, // Perth, Austrália
                { lat: -41.286640, lng: 174.775570 }, // Wellington, Nova Zelândia
                { lat: -36.850882, lng: 174.764488 }, // Auckland, Nova Zelândia
                
                // África
                { lat: -33.924869, lng: 18.424055 },  // Cidade do Cabo, África do Sul
                { lat: -26.204103, lng: 28.047305 },  // Joanesburgo, África do Sul
                { lat: 30.044420, lng: 31.235712 },   // Cairo, Egito
                { lat: 33.573110, lng: -7.589843 },   // Casablanca, Marrocos
                { lat: 6.524379, lng: 3.379206 },     // Lagos, Nigéria
                { lat: -1.292066, lng: 36.821945 },   // Nairóbi, Quênia
                
                // Oriente Médio
                { lat: 25.204849, lng: 55.270783 },   // Dubai, Emirados Árabes Unidos
                { lat: 31.768319, lng: 35.213711 },   // Jerusalém, Israel
                { lat: 32.085300, lng: 34.781768 },   // Tel Aviv, Israel
                { lat: 33.315241, lng: 44.366067 },   // Bagdá, Iraque
                { lat: 35.689197, lng: 51.388974 },   // Teerã, Irã
                
                // Locais Turísticos Famosos
                { lat: 40.431908, lng: -3.712360 },   // Palácio Real de Madrid
                { lat: 48.858370, lng: 2.294481 },    // Torre Eiffel
                { lat: 51.501364, lng: -0.141890 },   // Palácio de Buckingham
                { lat: 41.890210, lng: 12.492231 },   // Coliseu
                { lat: 27.175015, lng: 78.042155 },   // Taj Mahal
                { lat: 29.979235, lng: 31.134202 },   // Pirâmides de Gizé
                { lat: 40.748440, lng: -73.985664 },  // Empire State Building
                { lat: 34.101604, lng: -118.326741 }, // Hollywood Sign
                { lat: -22.951916, lng: -43.210487 }, // Cristo Redentor
                { lat: -33.856784, lng: 151.215297 }, // Ópera de Sydney
                { lat: 35.658581, lng: 139.745438 },  // Torre de Tóquio
                { lat: 22.278311, lng: 114.174801 },  // Victoria Peak
                { lat: 1.284669, lng: 103.852665 },   // Marina Bay Sands
                { lat: 48.858370, lng: 2.294481 },    // Arco do Triunfo
                { lat: 48.860611, lng: 2.337644 },    // Museu do Louvre
                { lat: 51.503324, lng: -0.119543 },   // London Eye
                { lat: 48.137154, lng: 11.576124 },   // Marienplatz
                { lat: 55.752023, lng: 37.617499 },   // Praça Vermelha
                { lat: 40.431908, lng: -3.712360 },   // Plaza Mayor
                { lat: 41.902782, lng: 12.496366 },   // Fontana di Trevi
            ];

            this.currentLocation = locations[Math.floor(Math.random() * locations.length)];
            
            // Configurar Street View
            this.streetView.setPosition(this.currentLocation);
            this.streetView.setPov({
                heading: Math.random() * 360,
                pitch: 0
            });

            // Resetar estado do jogo
            this.isGuessing = false;
            this.guessLocation = null;
            this.marker.setPosition(null);
            document.getElementById('guess-btn').disabled = false;
            document.getElementById('next-round-btn').disabled = true;
            document.getElementById('result').classList.add('hidden');

            // Resetar mapa
            this.resetMap();

            // Resetar contador de tentativas após sucesso
            this.retryCount = 0;
        } catch (error) {
            console.error('Erro ao carregar nova localização:', error);
            this.handleError(error);
        }
    }

    resetMap() {
        // Limpar todos os marcadores
        this.clearMarkers();
        
        // Limpar todas as linhas
        this.polylines.forEach(line => {
            line.setMap(null);
        });
        this.polylines = [];

        // Resetar o zoom e centralização do mapa
        this.map.setZoom(2);
        this.map.setCenter({ lat: 0, lng: 0 });

        // Resetar o marcador principal
        if (this.marker) {
            this.marker.setPosition(null);
        }
    }

    clearMarkers() {
        // Remover todos os marcadores do mapa
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    async makeGuess() {
        if (!this.isGuessing) {
            try {
                this.isGuessing = true;
                this.guessLocation = this.marker.getPosition();
                
                if (!this.guessLocation) {
                    alert('Por favor, marque uma localização no mapa!');
                    this.isGuessing = false;
                    return;
                }

                const distance = this.calculateDistance(
                    this.currentLocation.lat,
                    this.currentLocation.lng,
                    this.guessLocation.lat(),
                    this.guessLocation.lng()
                );

                const points = this.calculatePoints(distance);
                this.score += points;

                // Atualizar UI
                document.getElementById('distance').textContent = `${Math.round(distance)} km`;
                document.getElementById('points-earned').textContent = points;
                document.getElementById('score').textContent = this.score;
                document.getElementById('result').classList.remove('hidden');
                document.getElementById('guess-btn').disabled = true;
                document.getElementById('next-round-btn').disabled = false;

                // Mostrar localização real no mapa
                const realMarker = new google.maps.Marker({
                    position: this.currentLocation,
                    map: this.map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#FF0000',
                        fillOpacity: 1,
                        strokeColor: '#FF0000',
                        strokeWeight: 2
                    }
                });
                this.markers.push(realMarker);

                // Desenhar linha entre o palpite e a localização real
                const line = new google.maps.Polyline({
                    path: [
                        this.guessLocation,
                        this.currentLocation
                    ],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    map: this.map
                });
                this.polylines.push(line);

                // Ajustar o zoom do mapa para mostrar ambos os pontos
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(this.guessLocation);
                bounds.extend(this.currentLocation);
                this.map.fitBounds(bounds);
            } catch (error) {
                console.error('Erro ao fazer palpite:', error);
                this.handleError(error);
            }
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    calculatePoints(distance) {
        // Sistema de pontuação baseado na distância
        if (distance < 1) return 5000;
        if (distance < 5) return 4000;
        if (distance < 10) return 3000;
        if (distance < 50) return 2000;
        if (distance < 100) return 1000;
        if (distance < 500) return 500;
        return 100;
    }

    handleError(error) {
        this.retryCount++;
        
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            const waitTime = Math.min(30, Math.pow(2, this.retryCount)); // Espera exponencial
            alert(`Muitas requisições em um curto período. Por favor, aguarde ${waitTime} segundos e tente novamente.`);
            setTimeout(() => {
                this.retryCount = 0;
                this.loadNewLocation();
            }, waitTime * 1000);
        } else {
            alert('Ocorreu um erro. Por favor, tente novamente.');
        }
        
        console.error('Erro:', error);
        
        // Habilitar botões novamente
        document.getElementById('guess-btn').disabled = false;
        document.getElementById('next-round-btn').disabled = false;
        this.isGuessing = false;
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    new GeoFinder();
}); 