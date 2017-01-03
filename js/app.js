(function() {
  'use strict';
  angular.module("EMAILAPP", ['ngRoute', 'ui.router','xeditable','file-model','isteven-multi-select','toaster', 'ngAnimate','ngTable'])
  .controller('LOGINCTRL', function ($scope, $state, $banco,$rootScope) {
    $("#menu").css("visibility", "hidden");
    $scope.liberado = false;
    // Verifica se usuário existe no firebase
    $scope.verificaLogin = function (usuario) {
      localStorage.removeItem("roload");
      firebase.auth().signInWithEmailAndPassword(usuario.email, usuario.senha).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
      var user = firebase.auth().currentUser;
      if (user) {
        localStorage.setItem("liberado", "liberado");
        $state.go("home");
      }
    };
    var user = firebase.auth().currentUser;
    if (user) {
      localStorage.setItem("liberado",true);
      location.reload();
      $state.go("home");
    }
    $scope.sair = function() {
      firebase.auth().signOut().then(function() {
        $rootScope.userL = undefined;
        localStorage.removeItem("liberado");
        $state.go("login");
      }, function(error) {
        // An error happened.
      });
    }

  })
  .run(function($banco,  $rootScope) {
    $rootScope.userL = $banco.getAcesso();
    $rootScope.$watch('userL', function() {
      console.log($rootScope.userL);
      // 789joaopaulo@gmail.com
        if($rootScope.userL == "liberado"){ $("#menu").css("visibility", "visible");}else{$("#menu").css("visibility", "visible");};
    });
    // firebase config LOGIN
    var config = {
      apiKey: "",
      authDomain: "",
      databaseURL: "",
      storageBucket: "",
      messagingSenderId: ""
    };
    firebase.initializeApp(config);
    $banco.setDatabase("EMAILAPP");
  })
  .service("$banco",["$rootScope", "$q", function ($rootScope, $q) {
    // Libera o menu ?
    var liberado = false;
    this.liberarAcesso = function (boo) {
      console.log(boo);
      liberado = boo;
    }
    this.getAcesso = function () {
      return localStorage.getItem("liberado");
    }
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
      if(!jsonDocument._id) {
        database.post(jsonDocument).then(function(response) {
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
    // retorna todos registros
    this.all = function () {
      return database.allDocs({
        include_docs: true,
        attachments: true,
      })
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
      controller: "EMAILCTRL"
    }).state('novoemail',{
      url: "/novoemail",
      params: {emaildata: null},
      templateUrl : "pages/email/novoemail.html",
      controller: "EMAILCTRL"
    }).state('cursos',{
      url: "/cursos",
      templateUrl : "pages/curso/cursos.html",
      controller: "CURSOSCTRL"
    }).state('cursoui',{
      url: "/cursoui",
      params: {cadastro: null},
      templateUrl : "pages/curso/cursoui.html",
      controller: "CURSOSCTRL"
    }).state('turmas',{
      url: "/turmas",
      params: {curso: null},
      templateUrl : "pages/turma/turmas.html",
      controller: "TURMACTRL"
    }).state('turmaui',{
      url: "/turmaui",
      params: {curso: null, turma: null},
      templateUrl : "pages/turma/turmaui.html",
      controller: "TURMACTRL"
    }).state('emailsturma',{
      url: "/emailsturma",
      params: {turma: null, curso : null},
      templateUrl : "pages/turma/emailsturma.html",
      controller: "TURMACTRL"
    }).state('config',{
      url: "/config",
      templateUrl : "pages/conf/confui.html",
      controller: "CONFIGCTRL"
    })
    ;
    $urlRouterProvider.otherwise("login");
  });
})();
