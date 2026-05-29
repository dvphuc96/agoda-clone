<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>GoStay - Dat phong khach san & villa tai Viet Nam</title>
        <?php
            $jsFiles = glob(public_path('assets/index-*.js'));
            $cssFiles = glob(public_path('assets/index-*.css'));
            $jsFile = $jsFiles ? basename($jsFiles[0]) : '';
            $cssFile = $cssFiles ? basename($cssFiles[0]) : '';
        ?>
        @if($cssFile)
        <link rel="stylesheet" href="/assets/{{ $cssFile }}">
        @endif
    </head>
    <body>
        <div id="root"></div>
        @if($jsFile)
        <script type="module" src="/assets/{{ $jsFile }}"></script>
        @endif
    </body>
</html>
