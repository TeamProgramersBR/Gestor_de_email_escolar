(function() {
  'use strict';
  var app = angular.module('gestorDeEmail');
  // Inicio do controller
  app.controller('loginCTRL' ,function ($scope, $database ,$stateParams,$state, $rootScope){
    $scope.libearmenu = false;
    if (localStorage.getItem("logado") != null) {
        $scope.libearmenu = true;
        $state.go('inicio');
    }else{
        $state.go('login');
    }
    var configuracao = {};
    $database.allDocs().then(function (docs) {
      angular.forEach(docs.rows, function (value) {
        if(value.doc.tipo == "configuracoes") configuracao = value.doc;
      });
      if (jQuery.isEmptyObject(configuracao)) {
        $state.go('configuracoes');
      }
      $scope.$apply();
    });

    $scope.logar = function (logar) {
      if (logar == undefined) {
        bootbox.alert("Preencha o usuário e a senha");
      }
      if (logar.usuario == configuracao.userarioGestor && logar.senha == configuracao.senhaGestor) {
        localStorage.setItem("logado", true);
        $scope.libearmenu = true;
        location.reload();
      }else{
        bootbox.alert("Usuário ou senha incorretos");
      }
    }
    $scope.sair = function () {
      bootbox.confirm({
        message: "Tem certeza que deseja sair do sistema",
        buttons: {
          confirm: {
            label: 'Sim',
            className: 'btn-success'
          },
          cancel: {
            label: 'Não',
            className: 'btn-danger'
          }
        },
        callback: function (result) {
          if (result) {
            localStorage.removeItem("logado");
            $scope.libearmenu = false;
            $state.go('login');
            location.reload();
          }
        }
      });
    }

  });

})();
