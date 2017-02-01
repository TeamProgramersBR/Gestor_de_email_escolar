(function() {
  'use strict';
  var app = angular.module('gestorDeEmail',['ngMaterial','ui.router','md.data.table','file-model','isteven-multi-select','ngAnimate']);
  // Estabelece comnunicação com banco de dados e etc...
  app.run(function($database, $rootScope) {
    $database.setDatabase('gestor');
    // $database.destroy();
  });

  // Comunicação geral com Banco de dados pouchdb
  app.service("$database", ["$rootScope", "$q", function($rootScope, $q) {
    // Configuração do banco de dados.
    var database;
    var changeListener;
    this.setDatabase = function(databaseName) {
      database = new PouchDB(databaseName);
    }
    this.startListening = function() {
      changeListener = database.changes({
        live: true,
        include_docs: true
      }).on("change", function(change) {
        if(!change.deleted) {
          $rootScope.$broadcast("$pouchDB:change", change);
        } else {
          $rootScope.$broadcast("$pouchDB:delete", change);
        }
      });
    }
    this.stopListening = function() {
      changeListener.cancel();
    }
    this.sync = function(remoteDatabase) {
      database.sync(remoteDatabase, {live: true, retry: true});
    }
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

    this.delete = function(documentId, documentRevision) {
      return database.remove(documentId, documentRevision);
    }

    this.get = function(documentId) {
      return database.get(documentId);
    }

    this.destroy = function() {
      database.destroy();
    }
    this.allDocs = function(){
      return database.allDocs({include_docs: true,attachments: true});
    }
  }]);
  // Configurações de URL
  app.config(function($stateProvider, $urlRouterProvider){
     $stateProvider
     .state('configuracoes', {
      url: "/configuracoes",
      templateUrl: "pages/config/config.html",
      controller: "configuracoes"
    })
     .state('infomaker', {
      url: "/infomaker",
      templateUrl: "paginas/infomaker.html"
    }).state('inicio', {
     url: "/home",
     templateUrl: "pages/home/index.html",
     controller: "email"
   }).state('login', {
      url: "/login",
      templateUrl: "pages/login/index.html",
      controller: "loginCTRL"
    }).state('curso', {
      url: "/curso",
      templateUrl: "pages/cursosETurmas/cursos/index.html",
      controller: "curso"
    }).state('cursoui', {
      url: "/cursoui",
      params: {curso: null},
      templateUrl: "pages/cursosETurmas/cursos/cursoui.html",
      controller: "curso"
    }).state('turma', {
      url: "/turma",
      params: {curso: null},
      templateUrl: "pages/cursosETurmas/turmas/index.html",
      controller: "turma"
    }).state('turmaui', {
      url: "/turmaui",
      params: {turma: null, curso: null},
      templateUrl: "pages/cursosETurmas/turmas/turmaui.html",
      controller: "turma"
    }).state('escreveremail', {
      url: "/escreveremail",
      params: {email:null},
      templateUrl: "pages/email/index.html",
      controller: "email"
    });
    $urlRouterProvider.otherwise("/login");
  });

})();
