#!/usr/bin/env python3
import os

ngBuild = 'ng build ems-oauth2-client'

print('Compilando o ems-oauth2-client')
os.system(ngBuild)
print('Compilado o ems-oauth2-client')

print('Subir aplicação? "s"/"n"')
validacao = input()

if validacao == "s":
   os.system('cd dist/ems-oauth2-client') 
   os.system('npm adduser')
   os.system('npm publish')
   print('Aplicação publicada')
else:
    print('não subiu a aplicação') 



