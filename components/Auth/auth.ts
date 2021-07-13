import 'text-encoding';
import 'react-native-get-random-values'
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Actor, HttpAgent, } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";

import { Ed25519KeyIdentity } from "@dfinity/identity";
const Buffer = require("buffer").Buffer;

export const login = async(url='https://fx.land/Web-Identity-Providers/?pubKey64=') => {
    const keyPair = Ed25519KeyIdentity.generate();
    const keyPairJson = keyPair.toJSON();
    keyPairJson[1] = '';
    
    const publicKey = JSON.stringify(keyPairJson);
    const publicKey64 = new Buffer(publicKey).toString("base64");
    console.log(publicKey64);
    url = url + publicKey64;

    const test = async() => {
        console.log('here0');
        let options = {
            identity: JSON.parse(publicKey)
        };

        const authClient = await AuthClient.create(options);
        console.log('here1');
        const identity = authClient.getIdentity();
        console.log('here2');
        const idlFactory = ({ IDL }) =>
            IDL.Service({
            whoami: IDL.Func([], [IDL.Principal], ['query']),
            });

        const canisterId = Principal.fromText('4k2wq-cqaaa-aaaab-qac7q-cai');

        const actor = Actor.createActor(idlFactory, {
            agent: new HttpAgent({
                host: 'https://boundary.ic0.app/',
                identity,
            }),
            canisterId,
        });
console.log('here3');
        actor.whoami().then((principal) => {
            console.log(principal.toText());
        });
    }

    WebBrowser.maybeCompleteAuthSession();
    Linking.canOpenURL(url).then(
        (url2) => {
            Linking.addEventListener('url', (event)=>{
                console.log(event.url);
                let { path, queryParams } = Linking.parse(event.url);
                console.log([path, queryParams]);
                //test();
                //WebBrowser.dismissBrowser();
            });
            WebBrowser.openBrowserAsync(url, {
                createTask: true,
            });
        }
    )
    /*
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({
        host: 'https://boundary.ic0.app/',
        identity,
    });
    
    const canisterId = Principal.fromText('4k2wq-cqaaa-aaaab-qac7q-cai');
    console.log(canisterId);
    const queryData = {
        methodName: 'createUser',
        arg: ???
    }
    agent.query(canisterId, queryData, identity, ).then((res)=>{
        console.log(res);
    })*/
}