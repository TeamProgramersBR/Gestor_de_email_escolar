(function() {
  'use strict';
  var app = angular.module('gestorDeEmail');
  // Inicio do controller
  app.controller('email' ,function ($scope, $database ,$stateParams,$state, $rootScope){
    // Configuração de paginação de emails
    $scope.query = {
      limit: 10,
      page: 1
    };
    // variaveis
    $scope.email = {};
    $scope.listaCursos = [];
    $scope.listaArquivos = [];
    $scope.listaTurmas = [];
    $scope.cursosSelecionados = [];
    $scope.turnosSelecionados = [];
    $scope.configuracao = {};
    $scope.emailsenviados = [];
    $scope.turmasDosCursos = [];
    // Traz todos os documentos do banco e os separa de acordo com a nescessiada.
    listarTudo();
    function listarTudo() {
      $scope.listaCursos = [];
      $scope.listaArquivos = [];
      $scope.listaTurmas = [];
      $scope.cursosSelecionados = [];
      $scope.turnosSelecionados = [];
      $scope.emailsenviados = [];
      $scope.turmasDosCursos = [];
      $database.allDocs().then(function (docs) {
        angular.forEach(docs.rows, function (value) {
          if(value.doc.tipo == "turma") $scope.listaTurmas.push(value.doc);
          if(value.doc.tipo == "curso") $scope.listaCursos.push(value.doc);
          if(value.doc.tipo == "configuracoes") $scope.configuracao = value.doc;
          if(value.doc.tipo == "emailEnviado") $scope.emailsenviados.push(value.doc);
        });
        $scope.$apply();
      });
    }
    // Observa as variaveis de filtragem de turmas
    $scope.$watch('[cursosSelecionados,turnosSelecionados,dataInicioFiltro,dataFimFiltro]', function () {
      $scope.turmasDosCursos = [];
      angular.forEach($scope.cursosSelecionados, function (curso) {
        $scope.turmasDosCursos.push({'codigo':curso.nomeDoCurso, 'msGroup': true});
        angular.forEach($scope.listaTurmas, function (turma) {
          turma.datainicio = new Date(turma.datainicio);
          turma.dataconclusao = new Date(turma.dataconclusao);
          $scope.dataInicioFiltro = new Date($scope.dataInicioFiltro);
          $scope.dataFimFiltro = new Date($scope.dataFimFiltro);
          if(turma.tipo == "turma" && turma.cursoID == curso._id){
            if($scope.dataInicioFiltro != undefined && $scope.dataFimFiltro != undefined && turma.datainicio.getTime() >= $scope.dataInicioFiltro.getTime() && turma.dataconclusao.getTime() <= $scope.dataFimFiltro.getTime()){
              angular.forEach($scope.turnosSelecionados, function (turno) {

              });
              $scope.turmasDosCursos.push(turma);
            }
          };
        });
        $scope.turmasDosCursos.push({'msGroup': false});
      });

    }, true);
    // Caso seja para visualizar um email enviado.
    if ($stateParams.email != null) {
      var cp = angular.copy($stateParams.email);
      $scope.email.titulo = cp.email.subject;
      $scope.turmasDosCursos = cp.turmas;
      $scope.cursosSelecionados = cp.cursos;
      $scope.dataInicioFiltro = cp.turmaComDataInicio;
      $scope.dataFimFiltro = cp.turmaComDataFim;
      $scope.listaArquivos = cp.email.attachments;
      $scope.turnosSelecionados  = cp.turnos;
      console.log($scope.turnosSelecionados);
      $('#editorTexto').html(cp.email.html);
    }
    // Envia o email
    $scope.enviarEmail = function (email) {
      email.corpo = $('#editorTexto')[0].innerHTML+'<br><br><br>';
      bootbox.confirm({
        message: "Tem certeza que deseja enviar esse email?",
        buttons: {
          confirm: {
            label: 'Sim prosseguir',
            className: 'btn-success'
          },
          cancel: {
            label: 'Não cancelar',
            className: 'btn-danger'
          }
        },
        callback: function (result) {
          if (result) {

            var listaDeEmails = "";
            angular.forEach($scope.turmasDosCursos, function (email) {
              if(email.emails != undefined){
                angular.forEach(email.emails, function (endereco) {
                  listaDeEmails += endereco.endereco + ",";
                });
              }
            });
            listaDeEmails = listaDeEmails.slice(0, -1);
            nodemailerEnviar(listaDeEmails);
          }
        }
      });
    }
    // O nodemailer recebe os emails é a configuração de smtp.
    function nodemailerEnviar(lista) {
      var dialog = bootbox.dialog({
        message: '<p class="text-center">Aguarde, o email está sendo enviado... Se houver anexos pode levar alguns minutos</p>',
        closeButton: false
      });
      var nodemailer = require('nodemailer');
      // create reusable transporter object using the default SMTP transport
      var smtpConfig = null;
      var transporter = null;
      if ($scope.configuracao.host == "smtp-mail.outlook.com") {
        smtpConfig = {
          host: $scope.configuracao.host,
          secureConnection: $scope.configuracao.ssl,
          port: $scope.configuracao.port,
          tls: {
            ciphers:'SSLv3'
          },
          auth: {
            user: $scope.configuracao.user,
            pass: $scope.configuracao.password
          }
        }
        transporter = nodemailer.createTransport(smtpConfig);
      }else{
        smtpConfig = {
          host: $scope.configuracao.host,
          port: $scope.configuracao.port,
          secure: $scope.configuracao.ssl,
          auth: {
            user: $scope.configuracao.user,
            pass: $scope.configuracao.password
          }
        };
        transporter = nodemailer.createTransport(smtpConfig);
      }
      // configurações de cabeçalho do nodemailer.
      var mailOptions = {
        from: '"'+$scope.configuracao.nomeE+'"<'+$scope.configuracao.user+'>', // sender address
        bcc: lista, // list of receivers
        subject: $scope.email.titulo, // Subject line
        text: '', // plaintext body
        html: $('#editorTexto')[0].innerHTML+'<br><br><br>'+$scope.configuracao.assinatura // html body
      };
      // Se houver anexos
      if($scope.listaArquivos.length >= 1){
        mailOptions.attachments = $scope.listaArquivos;
      }
      // Envia o email.
      console.log(mailOptions);
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          bootbox.alert("Houve um erro ao enviar o email "+error);
          dialog.modal('hide');
        }else{
          var emailEnviado = {};
          emailEnviado.email = mailOptions;
          emailEnviado.turmas = $scope.turmasDosCursos;
          emailEnviado.cursos = $scope.cursosSelecionados;
          emailEnviado.turmaComDataInicio = $scope.dataInicioFiltro ;
          emailEnviado.turmaComDataFim = $scope.dataFimFiltro ;
          emailEnviado.turnos = $scope.turnosSelecionados;
          emailEnviado.data = new Date();
          emailEnviado.tipo = "emailEnviado";
          $database.save(emailEnviado).then(function (info) {
            bootbox.alert("O email foi enviado com sucesso");
          });
          dialog.modal('hide');
        }
      });

    }
    // upload de arquivos
    $scope.upload = function () {
      console.log($scope.fileModel.size);
      if($scope.fileModel.size >= 24545398 ){
        toaster.pop({type: 'error',title: 'O anexo e maior que o permitido',body: 'Por-favor apenas arquivos com menos de 24mb',showCloseButton: true});
      }else{
        $scope.listaArquivos.push({"filename":$scope.fileModel.name, "path": $scope.fileModel.path})
      };
      $scope.fileModel = "";
    };
    // remove arquivos do envio
    $scope.removerArquivo = function (arquivo) {
      for(var i = $scope.listaArquivos.length; i--;) {
        if($scope.listaArquivos[i] === arquivo) {
          $scope.listaArquivos.splice(i, 1);
        }
      }
    }
    $.trumbowyg.svgPath = 'bower_components/trumbowyg/dist/ui/icons.svg';
    $('#editorTexto').trumbowyg({
      btnsDef: {
        // Customizables dropdowns
        image: {
          dropdown: ['upload', 'base64', 'noEmbed'],
          ico: 'insertImage'
        }
      },
      btns: [
        ['viewHTML'],
        ['undo', 'redo'],
        ['formatting'],
        'btnGrp-design',
        ['link'],
        ['image'],
        'btnGrp-justify',
        'btnGrp-lists',
        ['foreColor', 'backColor'],
        ['preformatted'],
        ['horizontalRule'],
        ['fullscreen']
      ],
      plugins: {
        // Add imagur parameters to upload plugin
        upload: {
          serverPath: 'https://api.imgur.com/3/image',
          fileFieldName: 'image',
          headers: {
            'Authorization': 'Client-ID 9e57cb1c4791cea'
          },
          urlPropertyName: 'data.link'
        }
      }
    });

    // Deleta email enviado
    $scope.deletar = function (documento) {
      bootbox.confirm({
        message: "Tem certeza que deseja deletar o email "+documento.email.subject+" ?",
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
            $database.delete(documento._id, documento._rev).then(function (sucesso) {
              listarTudo();
              $scope.$apply();
            }).catch(function (err) {
              bootbox.alert("Houve um erro ao deletar "+err);
            });
          }
        }
      });
    }
  });

})();
