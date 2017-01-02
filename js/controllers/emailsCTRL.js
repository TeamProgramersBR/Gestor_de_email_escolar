(function() {
  'use strict';
  angular.module('EMAILAPP').controller('EMAILCTRL', function($scope,$banco,$stateParams,toaster){
    // variavel que salva arquivos
    $scope.liberado = true;

    $scope.listaArquivos = [];
    $scope.email = {};
    $.trumbowyg.svgPath = 'node_modules/trumbowyg/dist/ui/icons.svg';
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
    // upload de arquivos
    $scope.upload = function () {
      if($scope.fileModel.size >= 25600 ){
        toaster.pop({type: 'error',title: 'O anexo e maior que o permitido',body: 'Por-favor apenas arquivos com menos de 25mb',showCloseButton: true});
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
    // Todos documentos
    $scope.turmas = [];
    $banco.all().then(function (documentos) {
      console.log(documentos);
      angular.forEach(documentos.rows, function (documento) {
        if(documento.doc.tipo == "curso") $scope.turmas.push(documento.doc);
        $scope.$apply();
      });
    });
    // Filtra turmas para pegar os emails
    $scope.aplicaFiltros = function () {
      var temp = [];
      $banco.all().then(function (documentos) {
        var temp = [];
        angular.forEach(documentos.rows, function (documento) {
          if(documento.doc.tipo == "turma"){
            for (var i = 0; i < $scope.turnosFilter.length; i++) {
              if(documento.doc.turno == $scope.turnosFilter[i].turno) temp.push(documento.doc);
            };
          };
        });
        ///
        var tempb = [];
        for (var i = 0; i < $scope.cursosFilter.length; i++) {
          tempb.push({"msGroup":true,"codigo":"<strong>"+$scope.cursosFilter[i].nome+"</strong>"})
          for (var j = 0; j < temp.length; j++) {
            if(temp[j].curso == $scope.cursosFilter[i]._id){
              var temporary = angular.copy(temp[j]);
              temporary.nomeDoCurso = $scope.cursosFilter[i].nome;
              tempb.push(temporary)
            };
          };
        };

        $scope.turmasAplicar = tempb;
        $scope.$apply();
        ///
      });
    };
    //enviar email
    $scope.enviarEmail = function () {
      if($scope.email.titulo == undefined) {
        toaster.pop({type: 'error',title: 'Preecha o titulo do email',body: 'Falta preencher o titulo do email',showCloseButton: true});
      }else if ($scope.turmasFiltro == undefined) {
        toaster.pop({type: 'error',title: 'Seleciona turmas',body: 'Selecione as turmas a qual o email sera enviado',showCloseButton: true});
      }else{
        var conf = {};
        $scope.enviarPara = [];
        $banco.all().then(function (documentos) {
          angular.forEach(documentos.rows, function (documento) {
            angular.forEach($scope.turmasFiltro, function (turm) {
              if(documento.doc.tipo == "emails" && documento.doc.turmaID == turm._id){
                $scope.enviarPara.push(documento.doc.emails);
              };
            });
            if(documento.doc.tipo === "configuração"){
              conf = documento.doc;
            };
          });
          var emailssend = "";
          console.log($scope.enviarPara);
          angular.forEach($scope.enviarPara, function (emails) {
            angular.forEach(emails, function (doc) {
              emailssend += doc.email+",";
            });
          });
          emailssend = emailssend.slice(0, -1);
          $scope.$apply();
          email(conf,emailssend);
        });
      }
    };

    function email(config,listaDeEmails) {
      var nodemailer = require('nodemailer');
      // create reusable transporter object using the default SMTP transport
      var smtpConfig = {
        host: config.host,
        port: config.port,
        secure: config.ssl,
        auth: {
          user: config.user,
          pass: config.password
        }
      };
      var transporter = nodemailer.createTransport(smtpConfig)
      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: config.user, // sender address
        to: listaDeEmails, // list of receivers
        subject: $scope.email.titulo, // Subject line
        text: '', // plaintext body
        html: $('#editorTexto')[0].innerHTML+'<br><br><br>'+config.assinatura // html body
      };
      if($scope.listaArquivos.length >= 1){
        mailOptions.attachments = $scope.listaArquivos;
      }
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        toaster.pop({type: 'info',title: 'Aguarde a mensagem de confirmação',body: 'Enviar o email pode demorar um pouco',showCloseButton: true,timeout: 3000});
        if(error){
          return console.log(error);
          toaster.pop({type: 'error',title: 'Houve um erro ao enviar o email',body: error,showCloseButton: true,timeout: 3000});
        }else {
          toaster.pop({type: 'success',title: 'Email foi enviado com sucesso',body: 'O email foi enviado para as turmas selecionadas',showCloseButton: true,timeout: 13000});
          var turmasEnviadas = [];
          var cursoEnviados = [];
          angular.forEach($scope.cursosFilter, function (curso) {
            cursoEnviados.push(curso._id);
          });
          angular.forEach($scope.turmasFiltro, function (turma) {
            turmasEnviadas.push(turma._id);
          });
          var emailEnviado = {};
          emailEnviado.email = mailOptions;
          emailEnviado.turmas = turmasEnviadas;
          emailEnviado.cursos = cursoEnviados;
          emailEnviado.data = new Date();
          emailEnviado.tipo = "emailEnviado";
          $banco.save(emailEnviado).then(function (info) {
            toaster.pop({type: 'success',title: 'Email foi salvo no banco de dados',body: 'O email fica disponivel para visualização na home do sistema',showCloseButton: true,timeout: 13000});
          });

        }
        // console.log('Message sent: ' + info.response);
      });
    }
    // Traz emails enviados
    $scope.emailsEnviados = function () {
      $scope.enviados = [];
      $banco.all().then(function (documentos) {
        angular.forEach(documentos.rows ,function (doc) {
          if(doc.doc.tipo == "emailEnviado") $scope.enviados.push(doc.doc);
        });
        angular.forEach($scope.enviados, function (enviado) {
          angular.forEach(documentos.rows ,function (doc) {
            for (var i = 0; i < enviado.cursos.length; i++) {
              if (doc.doc.tipo == "curso" && enviado.cursos[i] == doc.doc._id) enviado.cursos[i] = doc.doc.nome;
            };
            for (var i = 0; i < enviado.turmas.length; i++) {
              if (doc.doc.tipo == "turma" && enviado.turmas[i] == doc.doc._id) enviado.turmas[i] = doc.doc.codigo;
            };
          });
        });
        $scope.$apply();
      });
    }


  });
})();
