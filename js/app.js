(function() {
  'use strict';
  angular.module("EMAILAPP", ['ngRoute', 'ui.router'])
  .controller('LOGINCTRL', function ($scope, $state) {
    // firebase config LOGIN
    var config = {
      apiKey: "AIzaSyAAGQiJT8cAv88FauzeW1KjeV-TEv-R0tw",
      authDomain: "mailsend-7d77e.firebaseapp.com",
      databaseURL: "https://mailsend-7d77e.firebaseio.com",
      storageBucket: "mailsend-7d77e.appspot.com",
      messagingSenderId: "675543414386"
    };
    firebase.initializeApp(config);
    // Verifica se usuário existe no firebase
    $scope.verificaLogin = function (usuario) {
      firebase.auth().signInWithEmailAndPassword(usuario.email, usuario.senha).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
    var user = firebase.auth().currentUser;
    console.log(user);
    if (user != undefined) {
      $state.go("home");
    }else{
      console.log("logou não");
    }
    };
  })
  .run(function($banco,  $rootScope) {
    $banco.setDatabase("EMAILAPP");

  })
  .service("$banco",["$rootScope", "$q", function ($rootScope, $q) {
    // seta o banco de dados.
    var database;
    this.setDatabase = function(databaseName) {
      database = new PouchDB(databaseName);
    }
    // Sincroniza o banco local com um banco remoto.
    this.sync = function(remoteDatabase) {
      return database.sync(remoteDatabase, {
        live: true,
        retry: true
      });
    }
    // seta serviço de escuta a mudanças no banco.
    this.startListening = function() {
      changeListener = database.changes({
        live: true,
        include_docs: true
      }).on("change", function(change) {

        if (!change.deleted) {
          // console.log("Mudou?");
          $rootScope.$broadcast("$pouchDB:change", change);
        } else {
          // console.log("deletou?");
          $rootScope.$broadcast("$pouchDB:delete", change);
        }
      });
    }
    // salva um documento no banco.
    this.save = function(jsonDocument) {
      var deferred = $q.defer();
      if (!jsonDocument._id) {
        jsonDocument._id = new Date().toISOString();
        database.put(jsonDocument).then(function(response) {
          deferred.resolve(response);
        }).catch(function(error) {
          deferred.reject(error);
        });
      } else {
        database.put(jsonDocument).then(function(response) {
          deferred.resolve(response);
        }).catch(function(error) {
          deferred.reject(error);
        });
      }
      return deferred.promise;
    }
    // Deleta um documento do banco.
    this.delete = function(documentId, documentRevision) {
      return database.remove(documentId, documentRevision);
    }
    // Obtem um documento do banco.
    this.get = function(documentId) {
      return database.get(documentId);
    }

  }])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "pages/login.html",
      controller: "LOGINCTRL"
    })
    .state('home',{
      url: "/home",
      templateUrl : "pages/home.html",
      controller: "HOMECTRL"
    }).state('cursos',{
      url: "/cursos",
      templateUrl : "pages/curso/cursos.html",
      controller: "CURSOSCTRL"
    }).state('turmas',{
      url: "/turmas",
      templateUrl : "pages/turma/turmas.html",
      controller: "TURMACTRL"
    }).state('config',{
      url: "/config",
      templateUrl : "pages/conf/confui.html",
      controller: "CONFIGCTRL"
    })
    ;
    $urlRouterProvider.otherwise("login");
  })
})();
