import { Injectable } from "@angular/core";

@Injectable()
export class ResourceOwner{

    public static localStorage:any  = '';

    public static client_id: any = 0;
    
    private codigo:any = 0;

    private resource_owner:any = {
        active: true,
        codigo:0,
        cpf:'',
        email:'',
        id:0,
        lista_perfil:[],
        lista_permission:[],
        login:'',
        name:'',
        remap_user_id: null,
        subtype: 0,
        type: 0
    };

    private user: string = '';

    constructor(){
        
    }


    public getClientId(){
        return ResourceOwner.client_id;
    }

    public getCodigo(){
        this.codigo = ResourceOwner.localStorage.resource_owner.id;
        return this.codigo;
    }

    public getResourceOwner(){
        this.resource_owner = ResourceOwner.localStorage.resource_owner;
        return this.resource_owner;
    }

    public getUser(){
        this.user = ResourceOwner.localStorage.resource_owner.name;
        return this.user;
    }


}