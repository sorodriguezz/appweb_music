import {Injectable} from '@angular/core';
import { HttpResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map'
import 'rxjs/Rx';
import { GLOBAL } from './global';

@Injectable()
export class UserService{
    public url: string;

    constructor(private _http: HttpClient){
        this.url = GLOBAL.url;
    }

    signup(user_to_login, gethash = null){
        if(gethash != null){
            user_to_login.gethash = gethash;
        }
       let json = JSON.stringify(user_to_login);
       let params = json;

       let headers = new HttpHeaders({'Content-Type':'application/json'});

       return this._http.post(this.url+'login', params, {headers: headers});
    }
}
