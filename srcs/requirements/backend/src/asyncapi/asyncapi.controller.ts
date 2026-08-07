import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('asyncapi')
export class AsyncApiController {
    @Get('yaml')
    getYaml(@Res() res: Response) {
        const yaml = readFileSync(join(process.cwd(), 'asyncapi/asyncapi.yaml'), 'utf8');
        res.setHeader('Content-Type', 'text/yaml');
        res.send(yaml);
    }

    @Get()
    getViewer(@Res() res: Response) {
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                <link rel="stylesheet" href="https://unpkg.com/@asyncapi/react-component@latest/styles/default.min.css">
                </head>
                <body>
                    <div id="root"></div>
                    <script src="https://unpkg.com/@asyncapi/react-component@latest/browser/standalone/index.js"></script>
                    <script>
                        AsyncApiStandalone.render({
                        schema: { url: '/asyncapi/yaml' },
                        config: {}
                        }, document.getElementById('root'));
                    </script>
                </body>
            </html>`);
    }
}
