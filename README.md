# EmsOauth2

Projeto ems-oauth2-client [Oauth2 Client](https://github.com/erlangMS/oauth2-client.git) version 6.3.22.

## Development server

Para rodar a versão certa do projeto é necessário as seguintes versões: 

nodejs  deve ser <= v8.10.0
npm deve ser <= 6.9.0
angular/cli  = 6.0.8

`sudo apt install nodejs`
`sudo npm install -g @angular/cli@6.0.8`


## Build

Para buildar o pacote ems-oauth2-client é necessário os seguintes passos:
`ng build ems-oauth2-client`
Será gerado na pasta dist o pacote ems-oauth2-client. Dentro de dist e da pasta ems-oauth2-client vá na pasta fesm5, no arquivo ems-oauth2-client.js e dentro da pasta ems-oauth2-client.js trocar esta parte do arquivo

`HttpService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    __decorate([
        __param(1, Optional()), __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, HttpHeaders, Number]),
        __metadata("design:returntype", Observable)
    ], HttpService.prototype, "get", null);
    __decorate([
        __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable)
    ], HttpService.prototype, "post", null);
    __decorate([
        __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable)
    ], HttpService.prototype, "put", null);
    __decorate([
        __param(1, Optional()), __param(2, Optional()), __param(3, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable)
    ], HttpService.prototype, "delete", null);
    return HttpService;
}(ServiceUtil));`

por esta parte do arquivo em ambos os arquivos compilados .js

`HttpService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    __decorate([
        __param(1, Optional()), __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, HttpHeaders, Number]),
        __metadata("design:returntype", Observable$1)
    ], HttpService.prototype, "get", null);
    __decorate([
        __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable$1)
    ], HttpService.prototype, "post", null);
    __decorate([
        __param(2, Optional()), __param(3, Optional()), __param(4, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable$1)
    ], HttpService.prototype, "put", null);
    __decorate([
        __param(1, Optional()), __param(2, Optional()), __param(3, Optional()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, HttpHeaders]),
        __metadata("design:returntype", Observable$1)
    ], HttpService.prototype, "delete", null);
    return HttpService;
}(ServiceUtil));`

