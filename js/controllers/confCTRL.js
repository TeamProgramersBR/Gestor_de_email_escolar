(function() {
  'use strict';
  angular.module('EMAILAPP').controller('CONFIGCTRL', function($scope,$banco,$stateParams){
    // Configuração Controle;
    $scope.config = {"user":"","password":"","host":"","port":"","ssl":"","tls":"","timeout":"","domain":"","authentication":""};
    // Se configuração existir então e exibida na interface.
    $banco.all().then(function (documentos) {
      angular.forEach(documentos.rows, function (documento,key) {
        if (documento.doc.tipo == "configuração") {
          $scope.config = documento.doc;
          $scope.$apply();
        }
      });
    });
    // Salva
    $scope.salvar = function (configuracao) {
      var temp = angular.copy(configuracao);
      temp.tipo = "configuração";
      $banco.save(temp);
    }

  });
})();
